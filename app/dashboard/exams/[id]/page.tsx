import ExamStatus from "@/components/dashboard/ExamStatus";
import Select from "@/components/dashboard/Select";
import { examStage, canEnterExamMarks } from "@/lib/exam-lifecycle";
import MarkGrid from "@/features/examinations/MarkGrid";
import Modal from "@/components/dashboard/Dialog";
import Tabs from "@/components/dashboard/Tabs";
import { prisma } from "@/lib/prisma";
import {
  saveExamSubject,
  saveExamSchedule,
} from "@/features/examinations/actions";
import { Field, inputClass } from "@/components/dashboard/SchoolUI";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import { examWorkspace } from "@/lib/exam-queries";
import { entryResult, resultRanks } from "@/lib/exam-entry";
import { applies } from "@/lib/school-rules";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ActionForm from "@/components/dashboard/ActionForm";
import {
  Panel,
  Stats,
  Badge,
  linkClass,
} from "@/components/dashboard/SchoolUI";
import { saveMarks, changeExamStatus } from "../actions";
export const metadata = { title: "Exam marks - Dihliz" };
export default async function ExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requirePageUser("/dashboard/exams");
  const { id } = await params,
    workspace = await examWorkspace(user, id);
  if (!workspace) notFound();
  const { exam, subjects, candidates, scope, partial } = workspace;
  const stage = examStage(exam);
  const requestedTab = (await searchParams).tab;
  const requested = requestedTab === "results" ? "analysis" : requestedTab;
  const canEnterMarks =
    canEnterExamMarks(exam, user.role) && subjects.some((s) => s.canEdit);
  const tab =
    ["overview", "marks", "analysis", "subjects"].includes(requested ?? "") &&
    !(
      stage === "Scheduled" && ["marks", "analysis"].includes(requested ?? "")
    ) &&
    !(requested === "marks" && !canEnterMarks)
      ? requested!
      : "overview";
  const definitions =
    tab === "subjects" && scope.admin
      ? await prisma.cohortSubject.findMany({
          where: {
            cohortId: exam.cohortId,
            isArchived: false,
            subject: { isArchived: false },
          },
          include: { subject: true, tutor: true },
        })
      : [];
  const editable = tab === "marks" && canEnterMarks;
  const results = candidates.map((c) =>
    entryResult(subjects, c.marks, c.studyStreamCode),
  );
  const ranks = resultRanks(results);
  const availableDefinitions = definitions.filter(
    (d) => !subjects.some((s) => s.cohortSubjectId === d.id),
  );
  const masterSubjectLink =
    "/dashboard/academic/subjects?year=" +
    exam.cohort.academicYearId +
    "&cohort=" +
    exam.cohortId;
  const table = (
    <div
      className={
        editable ? "" : "overflow-x-auto rounded-lg border border-slate-200"
      }
    >
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100 text-xs text-slate-600">
          <tr>
            {tab === "analysis" && <th className="p-3">Rank</th>}
            <th className="min-w-[200px] p-3">Student</th>
            {subjects.map((s) => (
              <th
                data-exam-subject={s.id}
                key={s.id}
                className="min-w-[140px] p-3"
              >
                {s.name}
                <span className="mt-1 block font-normal">
                  Max {s.maxMarks} · Pass {s.passMarks}
                </span>
                {s.studyStreamCode && (
                  <span className="block text-[10px]">{s.studyStreamCode}</span>
                )}
              </th>
            ))}
            <th className="p-3">Total</th>
            <th className="p-3">%</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {candidates
            .map((candidate, index) => ({ candidate, index }))
            .sort((a, b) =>
              tab === "analysis"
                ? (ranks[a.index] ?? Infinity) - (ranks[b.index] ?? Infinity)
                : 0,
            )
            .map(({ candidate, index }) => {
              const result = results[index];
              return (
                <tr
                  key={candidate.id}
                  data-candidate={candidate.id}
                  className="hover:bg-slate-50"
                >
                  {tab === "analysis" && (
                    <td className="p-3">
                      {partial ? "—" : (ranks[index] ?? "—")}
                    </td>
                  )}
                  <td className="p-3 font-medium">
                    {candidate.fullName}
                    <span className="mt-1 block text-xs text-slate-400">
                      {candidate.studentNumber}
                    </span>
                  </td>
                  {subjects.map((subject) => {
                    if (!applies(subject, candidate.studyStreamCode))
                      return (
                        <td
                          data-exam-subject={subject.id}
                          key={subject.id}
                          className="p-3 text-center text-slate-400"
                        >
                          —
                        </td>
                      );
                    const mark = candidate.marks.find(
                      (m) => m.examSubjectId === subject.id,
                    );
                    const value =
                      mark?.status === "ABSENT"
                        ? "ABSENT"
                        : mark?.status === "NOT_APPLICABLE"
                          ? "NA"
                          : (mark?.score ?? "");
                    return (
                      <td
                        data-exam-subject={subject.id}
                        key={subject.id}
                        className="p-2"
                      >
                        {editable && subject.canEdit ? (
                          <div className="flex items-center gap-1">
                            <input
                              name={"mark:" + candidate.id + ":" + subject.id}
                              data-maximum={subject.maxMarks}
                              data-pass={subject.passMarks}
                              defaultValue={value}
                              aria-label={
                                candidate.studentNumber + " " + subject.name
                              }
                              list="mark-status-options"
                              className="w-28 rounded-md border border-slate-300 p-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                              autoComplete="off"
                              placeholder={"0–" + subject.maxMarks}
                            />
                            <button
                              type="button"
                              data-absent
                              aria-label={
                                "Mark " +
                                candidate.studentNumber +
                                " absent for " +
                                subject.name
                              }
                              aria-pressed={value === "ABSENT"}
                              className="rounded-md border px-2 py-2 text-xs font-semibold hover:bg-red-50"
                            >
                              A
                            </button>
                          </div>
                        ) : (
                          <span
                            title={value === "ABSENT" ? "Absent" : undefined}
                            className={
                              "px-2 " +
                              (value === "ABSENT" ||
                              (typeof value === "number" &&
                                value < subject.passMarks)
                                ? "font-semibold text-red-600"
                                : "")
                            }
                          >
                            {value === ""
                              ? stage === "Locked"
                                ? "Not marked"
                                : "Awaiting marks"
                              : value === "ABSENT"
                                ? "A"
                                : value}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td
                    data-live-total
                    className={
                      "whitespace-nowrap p-3 " +
                      (candidate.marks.some(
                        (m) =>
                          m.status === "ABSENT" ||
                          (m.status === "SCORED" &&
                            (m.score ?? 0) <
                              (subjects.find((s) => s.id === m.examSubjectId)
                                ?.passMarks ?? 0)),
                      )
                        ? "font-semibold text-red-600"
                        : "")
                    }
                  >
                    {result.total} / {result.maximum}
                  </td>
                  <td data-live-percentage className="p-3">
                    {result.percentage === null
                      ? "—"
                      : result.percentage.toFixed(2)}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
  return (
    <DashboardLayout
      currentUser={user}
      title={exam.title}
      eyebrow={exam.cohort.displayName + " · " + exam.cohort.academicYear.name}
    >
      <div className="space-y-6">
        <Tabs
          active={tab}
          items={[
            ["overview", "Overview"],
            ["marks", "Mark entry"],
            ["analysis", "Mark analysis"],
            ["subjects", "Subject management"],
          ]
            .filter(
              ([id]) =>
                (stage !== "Scheduled" ||
                  !["marks", "analysis"].includes(id)) &&
                (id !== "marks" || canEnterMarks),
            )
            .map(([id, label]) => ({ id, label, href: "?tab=" + id }))}
        />
        {tab === "overview" && (
          <>
            {!scope.admin && stage !== "Ongoing" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {stage === "Scheduled"
                  ? "Mark entry opens on the exam date."
                  : "Mark entry is closed for teachers. Ask an admin to reopen the draft exam and extend its entry deadline if corrections are needed."}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                className={linkClass}
                href={
                  "/dashboard/exams?year=" +
                  exam.cohort.academicYearId +
                  "&cohort=" +
                  exam.cohortId
                }
              >
                ← Examinations
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                {exam.isArchived ? (
                  <Badge>Archived</Badge>
                ) : (
                  <ExamStatus exam={exam} />
                )}
                <span className="text-sm text-slate-500">
                  {exam.resultsPublic ? "Public" : "Private"}
                  {exam.resultsPublic && exam.status === "DRAFT"
                    ? " · Awaiting finalization"
                    : ""}
                </span>
                <span className="text-sm text-slate-500">
                  {exam.date.toISOString().slice(0, 10)}
                  <span className="ml-3">
                    Entry due:{" "}
                    {exam.markEntryDueDate?.toISOString().slice(0, 10) ??
                      "Not set"}{" "}
                    · Publish:{" "}
                    {exam.publishDate?.toISOString().slice(0, 10) ?? "Not set"}
                  </span>
                </span>
                {scope.admin && exam.status === "DRAFT" && !exam.isArchived && (
                  <Modal title="Edit exam schedule">
                    <ActionForm action={saveExamSchedule} label="Save schedule">
                      <input type="hidden" name="examId" value={exam.id} />
                      <input
                        type="hidden"
                        name="revision"
                        value={exam.revision}
                      />
                      <p className="text-sm text-slate-500">
                        Schedule for this class in{" "}
                        {exam.cohort.academicYear.name}. Other classes retain
                        their dates.
                      </p>
                      <Field label="Exam date">
                        <input
                          type="date"
                          name="date"
                          className={inputClass}
                          required
                          defaultValue={exam.date.toISOString().slice(0, 10)}
                          min={exam.cohort.academicYear.startDate
                            .toISOString()
                            .slice(0, 10)}
                          max={exam.cohort.academicYear.endDate
                            .toISOString()
                            .slice(0, 10)}
                        />
                      </Field>
                      <Field label="Mark entry due date">
                        <input
                          type="date"
                          name="markEntryDueDate"
                          className={inputClass}
                          required
                          defaultValue={exam.markEntryDueDate
                            ?.toISOString()
                            .slice(0, 10)}
                        />
                      </Field>
                      <Field label="Publish date">
                        <input
                          type="date"
                          name="publishDate"
                          className={inputClass}
                          required
                          defaultValue={exam.publishDate
                            ?.toISOString()
                            .slice(0, 10)}
                        />
                      </Field>
                    </ActionForm>
                  </Modal>
                )}
                <a
                  className={linkClass}
                  href={"/api/exams/" + exam.id + "/export"}
                >
                  Export results
                </a>
              </div>
            </div>
            <Stats
              items={[
                { label: "Students", value: candidates.length },
                { label: "Subjects", value: subjects.length },
                {
                  label: "Pending mark cells",
                  value: results.reduce(
                    (sum, result) => sum + result.missing,
                    0,
                  ),
                },
              ]}
            />
          </>
        )}
        {tab === "subjects" && (
          <Panel title="Exam subject settings">
            <p className="mb-4 text-sm text-slate-500">
              Subject masters belong in Academic setup. Settings below affect
              this examination only. The subject tutor enters marks by default;
              department heads and admins can also enter marks within their
              scope.
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {subjects.map((s) => (
                <div
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  key={s.id}
                >
                  <span className="text-sm">
                    {s.name} · maximum {s.maxMarks} · pass {s.passMarks}{" "}
                    {s.studyStreamCode ?? ""}
                    <span className="block text-xs text-slate-500">
                      Marks-entry tutor:{" "}
                      {s.markingTutor?.fullName ?? "Unassigned"}
                    </span>
                  </span>
                  {scope.admin && exam.status === "DRAFT" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Modal title={"Edit " + s.name} trigger="Edit">
                        <ActionForm action={saveExamSubject}>
                          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                            To rename this subject, update its name in the
                            master subject list first.{" "}
                            <Link
                              href={masterSubjectLink}
                              className="font-semibold underline"
                            >
                              Open master subjects
                            </Link>
                          </div>
                          <input type="hidden" name="examId" value={id} />
                          <input
                            type="hidden"
                            name="revision"
                            value={exam.revision}
                          />
                          <input
                            type="hidden"
                            name="examSubjectId"
                            value={s.id}
                          />
                          <input
                            type="hidden"
                            name="cohortSubjectId"
                            value={s.cohortSubjectId}
                          />
                          <Field label="Maximum">
                            <input
                              className={inputClass}
                              name="maxMarks"
                              type="number"
                              min=".01"
                              step=".01"
                              defaultValue={s.maxMarks}
                            />
                          </Field>
                          <Field label="Pass mark">
                            <input
                              className={inputClass}
                              name="passMarks"
                              type="number"
                              min="0"
                              step=".01"
                              defaultValue={s.passMarks}
                            />
                          </Field>
                        </ActionForm>
                      </Modal>
                      <Modal title={"Remove " + s.name} trigger="Remove">
                        <ActionForm
                          action={saveExamSubject}
                          label="Remove"
                          confirm={
                            "Remove this unmarked subject from the exam?"
                          }
                        >
                          <input type="hidden" name="examId" value={id} />
                          <input
                            type="hidden"
                            name="revision"
                            value={exam.revision}
                          />
                          <input
                            type="hidden"
                            name="examSubjectId"
                            value={s.id}
                          />
                          <input
                            type="hidden"
                            name="cohortSubjectId"
                            value={s.cohortSubjectId}
                          />
                          <input
                            type="hidden"
                            name="maxMarks"
                            value={s.maxMarks}
                          />
                          <input
                            type="hidden"
                            name="passMarks"
                            value={s.passMarks}
                          />
                          <input type="hidden" name="remove" value="on" />
                          <p className="text-sm text-slate-500">
                            Subjects with saved marks cannot be removed. The
                            master subject will be preserved.
                          </p>
                        </ActionForm>
                      </Modal>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {scope.admin && exam.status === "DRAFT" && (
              <Modal title="Add exam subject">
                {availableDefinitions.length ? (
                  <ActionForm action={saveExamSubject}>
                    <input type="hidden" name="examId" value={id} />
                    <input
                      type="hidden"
                      name="revision"
                      value={exam.revision}
                    />
                    <Field label="Subject">
                      <Select className={inputClass} name="cohortSubjectId">
                        {availableDefinitions.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.subject.name} · {d.tutor?.fullName ?? "No tutor"}{" "}
                            {d.studyStreamCode ?? ""}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Maximum">
                      <input
                        name="maxMarks"
                        className={inputClass}
                        type="number"
                        min=".01"
                        step=".01"
                        defaultValue={100}
                      />
                    </Field>
                    <Field label="Pass mark">
                      <input
                        name="passMarks"
                        className={inputClass}
                        type="number"
                        min="0"
                        step=".01"
                        defaultValue={40}
                      />
                    </Field>
                  </ActionForm>
                ) : (
                  <div
                    role="alert"
                    className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                  >
                    <p className="font-semibold">No more subjects available</p>
                    <p className="mt-2">
                      All active subjects assigned to this stream are already in
                      this exam. To add another, create it in the master subject
                      list and assign it to this stream first.
                    </p>
                    <Link
                      href={masterSubjectLink}
                      className="mt-3 inline-flex font-semibold underline"
                    >
                      Manage master subjects
                    </Link>
                  </div>
                )}
              </Modal>
            )}
          </Panel>
        )}
        {tab === "overview" && stage !== "Scheduled" && (
          <Panel
            title={
              exam.status === "DRAFT" ? "Provisional analysis" : "Mark analysis"
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              {subjects.map((s) => {
                const marks = candidates.flatMap((c) =>
                  c.marks.filter(
                    (m) =>
                      m.examSubjectId === s.id && m.status !== "NOT_APPLICABLE",
                  ),
                );
                const scored = marks.filter((m) => m.status === "SCORED");
                const avg = scored.length
                  ? (scored.reduce((sum, m) => sum + (m.score ?? 0), 0) /
                      scored.length /
                      s.maxMarks) *
                    100
                  : null;
                return (
                  <div className="rounded-lg border p-4 text-sm" key={s.id}>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p>
                      Scored average:{" "}
                      {avg === null ? "—" : avg.toFixed(2) + "%"}
                    </p>
                    <p>
                      Pass rate:{" "}
                      {marks.length
                        ? (
                            (marks.filter(
                              (m) =>
                                m.status === "SCORED" &&
                                (m.score ?? 0) >= s.passMarks,
                            ).length /
                              marks.length) *
                            100
                          ).toFixed(2) + "%"
                        : "—"}
                    </p>
                    <p>
                      Incomplete:{" "}
                      {
                        candidates.filter(
                          (c) =>
                            applies(s, c.studyStreamCode) &&
                            !c.marks.some((m) => m.examSubjectId === s.id),
                        ).length
                      }
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm">
              Rank distribution:{" "}
              {Array.from(new Set(ranks.filter((rank) => rank !== null)))
                .map(
                  (g) => g + ": " + ranks.filter((rank) => rank === g).length,
                )
                .join(" · ")}
            </p>
          </Panel>
        )}
        {["marks", "analysis"].includes(tab) && (
          <Panel
            title={
              partial
                ? "Marks · assigned subjects only"
                : tab === "analysis"
                  ? "Subject marks analysis"
                  : "Mark entry"
            }
          >
            {tab === "marks" && (
              <p className="mb-4 text-sm text-slate-500">
                Enter a score or use A for absent. NA means not applicable and
                excludes the subject from totals. Absent counts as zero and
                fails the subject; NA is excluded from totals. Totals and
                percentages update while entering marks.
                {partial ? " Totals show only subjects you can access." : ""}
              </p>
            )}
            <datalist id="mark-status-options">
              <option value="ABSENT" />
              <option value="NA" />
            </datalist>
            {editable ? (
              <ActionForm action={saveMarks} label="Save marks" hideSubmit>
                <input type="hidden" name="examId" value={exam.id} />
                <input type="hidden" name="revision" value={exam.revision} />
                <MarkGrid
                  key={exam.revision}
                  subjects={subjects}
                  partial={partial}
                  candidates={candidates.map((c) => ({
                    id: c.id,
                    studyStreamCode: c.studyStreamCode,
                    marks: c.marks,
                  }))}
                >
                  {table}
                </MarkGrid>
              </ActionForm>
            ) : (
              table
            )}
            <p className="mt-4 text-xs text-slate-500">
              Ranks compare completed students by percentage. Equal percentages
              share a rank; incomplete students are unranked.
              {partial
                ? " Rank is unavailable when only assigned subjects are visible."
                : ""}
            </p>
          </Panel>
        )}
        {scope.admin && exam.isArchived && (
          <Modal title="Restore examination">
            <ActionForm action={changeExamStatus} label="Restore">
              <input type="hidden" name="examId" value={exam.id} />
              <input type="hidden" name="revision" value={exam.revision} />
              <input type="hidden" name="nextStatus" value="RESTORE" />
            </ActionForm>
          </Modal>
        )}
        {tab === "overview" &&
          scope.admin &&
          !exam.isArchived &&
          exam.status !== "LOCKED" && (
            <Panel title="Exam workflow">
              <div className="flex flex-wrap gap-3">
                {(exam.status === "DRAFT"
                  ? [
                      { status: "FINAL", label: "Finalize results" },
                      { status: "ARCHIVE", label: "Archive draft" },
                    ]
                  : [
                      { status: "DRAFT", label: "Reopen as draft" },
                      { status: "LOCKED", label: "Lock results" },
                    ]
                ).map((action) => (
                  <Modal key={action.status} title={action.label}>
                    <ActionForm
                      action={changeExamStatus}
                      label={action.label}
                      confirm={
                        action.status === "LOCKED"
                          ? "Close mark entry for tutors? Admins can still correct marks."
                          : "Confirm this examination status change?"
                      }
                    >
                      <input type="hidden" name="examId" value={exam.id} />
                      <input
                        type="hidden"
                        name="revision"
                        value={exam.revision}
                      />
                      <input
                        type="hidden"
                        name="nextStatus"
                        value={action.status}
                      />
                      {action.status === "DRAFT" && (
                        <Field label="Correction reason">
                          <textarea
                            name="reason"
                            className={inputClass}
                            required
                            minLength={5}
                            maxLength={500}
                          />
                        </Field>
                      )}
                      <p className="text-sm text-slate-500">
                        {action.status === "FINAL"
                          ? "Save all marks first. Every applicable cell must be complete."
                          : action.status === "LOCKED"
                            ? "Locked results close tutor entry. Admin corrections remain available."
                            : "Existing student records and marks will be preserved."}
                      </p>
                    </ActionForm>
                  </Modal>
                ))}
              </div>
            </Panel>
          )}
      </div>
    </DashboardLayout>
  );
}
