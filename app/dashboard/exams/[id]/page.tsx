import MarkerForm from "@/features/examinations/MarkerForm";
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
import { applies, examResult } from "@/lib/school-rules";
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
  const requested = (await searchParams).tab;
  const tab = ["overview", "marks", "analysis", "subjects", "results"].includes(
    requested ?? "",
  )
    ? requested!
    : "overview";
  const tutors =
    tab === "subjects" && scope.admin
      ? await prisma.user.findMany({
          where: { role: "SUBJECT_TUTOR", isActive: true },
          select: { id: true, fullName: true },
          orderBy: { fullName: "asc" },
        })
      : [];
  const definitions =
    tab === "subjects" && scope.admin
      ? await prisma.cohortSubject.findMany({
          where: { cohortId: exam.cohortId, isArchived: false },
          include: { subject: true, tutor: true },
        })
      : [];
  const siblings =
    tab === "overview" && exam.eventId
      ? await prisma.exam.findMany({
          where: {
            eventId: exam.eventId,
            cohortId: { in: scope.cohorts.map((c) => c.id) },
          },
          include: { cohort: true },
        })
      : [];
  const editable =
    tab === "marks" &&
    exam.status === "DRAFT" &&
    !exam.isArchived &&
    subjects.some((s) => s.canEdit);
  const results = candidates.map((c) =>
    examResult(subjects, c.marks, c.studyStreamCode),
  );
  const table = (
    <div
      className={
        editable
          ? ""
          : "max-h-[70vh] overflow-auto rounded-lg border border-slate-200"
      }
    >
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100 text-xs text-slate-600">
          <tr>
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
            <th className="p-3">Grade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {candidates.map((candidate, index) => {
            const result = results[index];
            return (
              <tr key={candidate.id} className="hover:bg-slate-50">
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
                          placeholder="Score / status"
                        />
                      ) : (
                        <span className="px-2">
                          {value === "" ? "Pending" : value}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="whitespace-nowrap p-3">
                  {result.total} / {result.maximum}
                </td>
                <td className="p-3">
                  {result.missing || result.percentage === null
                    ? "—"
                    : result.percentage.toFixed(2)}
                </td>
                <td className="p-3">
                  <Badge>{result.grade}</Badge>
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
            <Badge>{exam.isArchived ? "ARCHIVED" : exam.status}</Badge>
            <span className="text-sm text-slate-500">
              {exam.date.toISOString().slice(0, 10)}
              <span className="ml-3">
                Entry due:{" "}
                {exam.markEntryDueDate?.toISOString().slice(0, 10) ?? "Not set"}{" "}
                · Publish:{" "}
                {exam.publishDate?.toISOString().slice(0, 10) ?? "Not set"}
              </span>
            </span>
            {scope.admin && exam.status === "DRAFT" && !exam.isArchived && (
              <Modal title="Edit exam schedule">
                <ActionForm action={saveExamSchedule} label="Save schedule">
                  <input type="hidden" name="examId" value={exam.id} />
                  <input type="hidden" name="revision" value={exam.revision} />
                  <p className="text-sm text-slate-500">
                    Schedule for this class in {exam.cohort.academicYear.name}.
                    Other classes retain their dates.
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
            <a className={linkClass} href={"/api/exams/" + exam.id + "/export"}>
              Export results
            </a>
          </div>
        </div>
        <Stats
          items={[
            { label: "Students", value: candidates.length },
            { label: "Visible subjects", value: subjects.length },
            {
              label: "Pending mark cells",
              value: results.reduce((sum, result) => sum + result.missing, 0),
            },
          ]}
        />
        <Tabs
          active={tab}
          items={[
            ["overview", "Overview"],
            ["marks", "Mark entry"],
            ["analysis", "Mark analysis"],
            ["subjects", "Subject management"],
            ["results", "Results"],
          ].map(([id, label]) => ({ id, label, href: "?tab=" + id }))}
        />
        {tab === "overview" && (
          <Panel title="Participating classes">
            <div className="divide-y">
              {siblings.map((e) => (
                <Link
                  className="flex justify-between py-3 text-sm"
                  key={e.id}
                  href={"/dashboard/exams/" + e.id + "?tab=overview"}
                >
                  <span>{e.cohort.displayName}</span>
                  <Badge>{e.status}</Badge>
                </Link>
              ))}
            </div>
          </Panel>
        )}
        {tab === "subjects" && (
          <Panel title="Exam subject settings">
            <p className="mb-4 text-sm text-slate-500">
              Subject masters belong in Academic setup. Settings below affect
              this examination only. Marked subjects retain their settings.
            </p>
            {subjects.map((s) => (
              <div
                className="flex items-center justify-between border-b py-3"
                key={s.id}
              >
                <span className="text-sm">
                  {s.name} · maximum {s.maxMarks} · pass {s.passMarks}{" "}
                  {s.studyStreamCode ?? ""}
                  <span className="block text-xs text-slate-500">
                    Marker: {s.markingTutor?.fullName ?? "Unassigned"}
                  </span>
                </span>
                {scope.admin && exam.status === "DRAFT" && (
                  <>
                    <MarkerForm
                      examId={id}
                      subjectId={s.id}
                      name={s.name}
                      revision={exam.revision}
                      tutorId={s.markingTutorId}
                      tutors={tutors}
                    />
                    <Modal title={"Edit " + s.name}>
                      <ActionForm action={saveExamSubject}>
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
                        <label className="text-sm">
                          <input name="remove" type="checkbox" /> Remove
                          unmarked subject
                        </label>
                      </ActionForm>
                    </Modal>
                  </>
                )}
              </div>
            ))}
            {scope.admin && exam.status === "DRAFT" && (
              <Modal title="Add exam subject">
                <ActionForm action={saveExamSubject}>
                  <input type="hidden" name="examId" value={id} />
                  <input type="hidden" name="revision" value={exam.revision} />
                  <Field label="Assigned class subject">
                    <select className={inputClass} name="cohortSubjectId">
                      {definitions
                        .filter(
                          (d) =>
                            !subjects.some((s) => s.cohortSubjectId === d.id),
                        )
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.subject.name} · {d.tutor?.fullName ?? "No tutor"}{" "}
                            {d.studyStreamCode ?? ""}
                          </option>
                        ))}
                    </select>
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
              </Modal>
            )}
          </Panel>
        )}
        {tab === "analysis" && (
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
              Grade distribution:{" "}
              {Array.from(new Set(results.map((r) => r.grade)))
                .map(
                  (g) => g + ": " + results.filter((r) => r.grade === g).length,
                )
                .join(" · ")}
            </p>
          </Panel>
        )}
        {["marks", "results", "analysis"].includes(tab) && (
          <Panel
            title={
              partial ? "Marks · assigned subjects only" : "Marks and results"
            }
          >
            <p className="mb-4 text-sm text-slate-500">
              Enter a score, ABSENT or NA. Blank cells remain pending. Absent
              counts as zero and fails the subject; NA is excluded from totals.
              Save marks to refresh results.
              {partial ? " Totals show only subjects you can access." : ""}
            </p>
            <datalist id="mark-status-options">
              <option value="ABSENT" />
              <option value="NA" />
            </datalist>
            {editable ? (
              <ActionForm action={saveMarks} label="Save marks">
                <input type="hidden" name="examId" value={exam.id} />
                <input type="hidden" name="revision" value={exam.revision} />
                <MarkGrid key={exam.revision} subjects={subjects}>
                  {table}
                </MarkGrid>
              </ActionForm>
            ) : (
              table
            )}
            <p className="mt-4 text-xs text-slate-500">
              Grades: A+ ≥90%, A ≥80%, B+ ≥70%, B ≥60%, C ≥50%, D ≥40%, E below
              40%. Any subject below its pass mark gives F. Incomplete exams
              have no final percentage.
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
        {tab === "results" &&
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
                          ? "Permanently lock these approved results?"
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
                            ? "Locked results preserve their snapshots and cannot be edited."
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
