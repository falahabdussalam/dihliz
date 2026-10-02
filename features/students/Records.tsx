import Select from "@/components/dashboard/Select";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { AuthUser } from "@/lib/auth";
import {
  Panel,
  Stats,
  Empty,
  Badge,
  Field,
  inputClass,
  linkClass,
} from "@/components/dashboard/SchoolUI";
import Modal from "@/components/dashboard/Dialog";
import ActionForm from "@/components/dashboard/ActionForm";
import {
  attendanceSummary,
  criteriaSchema,
  scoresSchema,
  performanceSummary,
  categories,
} from "@/features/operations/rules";
import { examWorkspace } from "@/lib/exam-queries";
import { examResult, applies } from "@/lib/school-rules";
import AchievementForm from "@/features/achievements/Form";
import { publishReport } from "@/features/reports/actions";
export default async function StudentRecords({
  enrollmentId,
  studentId,
  tab,
  user,
}: {
  enrollmentId: string;
  studentId: string;
  tab: string;
  user: AuthUser;
}) {
  if (tab === "overview") {
    const [enrollment, attendance, evaluations, contacts] = await Promise.all([
      prisma.studentEnrollment.findUniqueOrThrow({
        where: { id: enrollmentId },
        include: { cohort: true },
      }),
      prisma.attendanceEntry.findMany({
        where: {
          enrollmentId,
          register: { status: { in: ["SUBMITTED", "LOCKED"] } },
        },
        select: { status: true },
      }),
      prisma.performanceEntry.count({
        where: { enrollmentId, register: { status: "LOCKED" } },
      }),
      prisma.studentContact.count({ where: { studentId } }),
    ]);
    const summary = attendanceSummary(attendance);
    const activity =
      user.role === "SUPER_ADMIN"
        ? await prisma.auditLog.findMany({
            where: { entityId: { in: [studentId, enrollmentId] } },
            orderBy: { createdAt: "desc" },
            take: 20,
          })
        : [];
    return (
      <>
        <Stats
          items={[
            { label: "Current class", value: enrollment.cohort.displayName },
            {
              label: "Submitted attendance",
              value:
                summary.percentage === null ? "—" : summary.percentage + "%",
            },
            { label: "Approved monthly evaluations", value: evaluations },
          ]}
        />
        <Panel title="Record completeness">
          <p className="text-sm">
            {contacts
              ? "Contact details recorded."
              : "Contact details are missing."}{" "}
            {attendance.length ? "" : "Attendance has not yet been submitted."}
          </p>
          {user.role === "SUPER_ADMIN" && (
            <div className="mt-4">
              <Modal title="Administrative activity">
                {activity.map((a) => (
                  <p className="border-b py-2 text-sm" key={a.id}>
                    {a.createdAt.toISOString().slice(0, 16)} · {a.action}
                  </p>
                ))}
                {!activity.length && <Empty>No recorded changes.</Empty>}
              </Modal>
            </div>
          )}
        </Panel>
      </>
    );
  }
  if (tab === "academics") {
    const enrollment = await prisma.studentEnrollment.findUniqueOrThrow({
      where: { id: enrollmentId },
      include: {
        studyStream: true,
        cohort: {
          include: {
            subjects: {
              where: { isArchived: false },
              include: { subject: true, tutor: { select: { fullName: true } } },
            },
          },
        },
      },
    });
    return (
      <Panel title="Assigned subjects">
        {enrollment.cohort.subjects
          .filter((s) => applies(s, enrollment.studyStream?.code ?? null))
          .map((s) => (
            <p className="border-b py-3 text-sm" key={s.id}>
              {s.subject.name} · {s.tutor?.fullName ?? "Tutor unassigned"}
            </p>
          ))}
      </Panel>
    );
  }
  if (tab === "attendance") {
    const entries = await prisma.attendanceEntry.findMany({
      where: { enrollmentId },
      include: { register: true },
      orderBy: { register: { date: "desc" } },
    });
    const summary = attendanceSummary(
      entries.filter((e) => e.register.status !== "DRAFT"),
    );
    const months = Array.from(
      new Set(entries.map((e) => e.register.date.toISOString().slice(0, 7))),
    );
    return (
      <>
        <Stats
          items={[
            {
              label: "Present / Absent / Off",
              value:
                summary.present + " / " + summary.absent + " / " + summary.off,
            },
            {
              label: "Attendance",
              value:
                summary.percentage === null ? "—" : summary.percentage + "%",
            },
            {
              label: "Draft / unmarked entries",
              value: entries.filter(
                (e) => e.register.status === "DRAFT" || !e.status,
              ).length,
            },
          ]}
        />
        <Panel title="Monthly summary">
          {months.map((month) => {
            const s = attendanceSummary(
              entries.filter(
                (e) =>
                  e.register.status !== "DRAFT" &&
                  e.register.date.toISOString().startsWith(month),
              ),
            );
            return (
              <p className="border-b py-3 text-sm" key={month}>
                {month} · {s.percentage === null ? "—" : s.percentage + "%"} ·
                Present {s.present}, Absent {s.absent}, Off {s.off}
              </p>
            );
          })}
        </Panel>
        <Panel title="Daily history">
          <p className="mb-3 text-sm text-slate-500">
            Dates without a register are unmarked. Draft entries are excluded
            from percentages.
          </p>
          {entries.map((e) => (
            <div
              className="flex justify-between border-b py-3 text-sm"
              key={e.id}
            >
              <span>{e.register.date.toISOString().slice(0, 10)}</span>
              <span>{e.reason}</span>
              <Badge>
                {e.status ?? "UNMARKED"} · {e.register.status}
              </Badge>
            </div>
          ))}
          {!entries.length && <Empty>No attendance recorded.</Empty>}
        </Panel>
      </>
    );
  }
  if (tab === "performance") {
    if (!["SUPER_ADMIN", "CLASS_MENTOR", "HOSTEL_MENTOR"].includes(user.role))
      return (
        <Panel title="Performance">
          <Empty>
            Evaluations are available to assigned mentors and administrators.
          </Empty>
        </Panel>
      );
    const entries = await prisma.performanceEntry.findMany({
      where: {
        enrollmentId,
        ...(user.role === "HOSTEL_MENTOR"
          ? { register: { category: "HOSTEL_BEHAVIOUR" as const } }
          : user.role === "CLASS_MENTOR"
            ? {
                register: {
                  category: {
                    in: [
                      "CLASS_BEHAVIOUR" as const,
                      "STUDY_DISCIPLINE" as const,
                    ],
                  },
                },
              }
            : {}),
      },
      include: { register: true },
      orderBy: { register: { month: "desc" } },
    });
    return (
      <Panel title="Monthly evaluations">
        {entries.map((e) => {
          const criteria = criteriaSchema.parse(e.register.criteria),
            scores = scoresSchema.parse(e.scores),
            summary = performanceSummary(criteria, scores);
          return (
            <div className="mb-4 rounded-lg border p-4" key={e.id}>
              <h3 className="font-semibold">
                {e.register.month.toISOString().slice(0, 7)} ·{" "}
                {categories[e.register.category]}
              </h3>
              <p className="my-2 text-sm">
                {e.register.status} ·{" "}
                {summary.missing
                  ? "Incomplete"
                  : summary.percentage === null
                    ? "—"
                    : summary.percentage + "%"}
              </p>
              {criteria.map((c) => (
                <p key={c.id} className="text-sm">
                  {c.name}:{" "}
                  {scores[c.id]?.na
                    ? "NA"
                    : (scores[c.id]?.value ?? "Unmarked")}{" "}
                  / {c.maximum}
                </p>
              ))}
              <p className="mt-2 text-sm">{e.remarks}</p>
            </div>
          );
        })}
        {!entries.length && <Empty>No evaluations recorded.</Empty>}
      </Panel>
    );
  }
  if (tab === "examinations") {
    const candidates = await prisma.examCandidate.findMany({
      where: {
        enrollmentId,
        exam: { isArchived: false, event: { isDemo: false } },
      },
      select: { examId: true },
      orderBy: { exam: { date: "desc" } },
    });
    const workspaces = await Promise.all(
      candidates.map((c) => examWorkspace(user, c.examId)),
    );
    return (
      <Panel title="Examination results">
        <p className="mb-4 text-sm text-slate-500">
          DEMO examinations are excluded. Percentages apply to the displayed
          subject set; compare matching subjects between exams.
        </p>
        {workspaces.map((w) => {
          if (!w) return null;
          const candidate = w.candidates.find(
            (c) => c.enrollmentId === enrollmentId,
          );
          if (!candidate) return null;
          const r = examResult(
            w.subjects,
            candidate.marks,
            candidate.studyStreamCode,
          );
          return (
            <div className="border-b py-4" key={w.exam.id}>
              <Link
                className={linkClass}
                href={"/dashboard/exams/" + w.exam.id + "?tab=results"}
              >
                {w.exam.title}
              </Link>
              <p className="my-2 text-sm">
                {w.exam.status === "DRAFT" ? "Provisional · " : ""}
                {r.missing
                  ? "Incomplete"
                  : r.percentage === null
                    ? "—"
                    : r.percentage.toFixed(2) + "%"}{" "}
                · {r.grade}
              </p>
              {w.subjects
                .filter((s) => applies(s, candidate.studyStreamCode))
                .map((s) => (
                  <p className="text-sm" key={s.id}>
                    {s.name}:{" "}
                    {candidate.marks.find((m) => m.examSubjectId === s.id)
                      ?.score ??
                      candidate.marks.find((m) => m.examSubjectId === s.id)
                        ?.status ??
                      "Pending"}{" "}
                    / {s.maxMarks}
                  </p>
                ))}
            </div>
          );
        })}
        {!candidates.length && (
          <Empty>No non-demo examinations recorded.</Empty>
        )}
      </Panel>
    );
  }
  if (tab === "achievements") {
    const rows = await prisma.achievement.findMany({
      where: { enrollmentId, isArchived: false },
      orderBy: { date: "desc" },
    });
    return (
      <Panel title="Achievements">
        <div className="mb-4">
          {["SUPER_ADMIN", "CLASS_MENTOR"].includes(user.role) && (
            <AchievementForm enrollmentId={enrollmentId} />
          )}
        </div>
        {rows.map((r) => (
          <div
            className="flex flex-wrap justify-between gap-3 border-b py-4"
            key={r.id}
          >
            <div>
              <h3 className="font-semibold">{r.title}</h3>
              <p className="text-sm">
                {r.date.toISOString().slice(0, 10)} · {r.kind} · {r.award} ·{" "}
                {r.organiser}
              </p>
              {r.evidenceUrl && (
                <a
                  className="text-sm text-emerald-700 underline"
                  href={r.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Evidence
                </a>
              )}
            </div>
            {["SUPER_ADMIN", "CLASS_MENTOR"].includes(user.role) && (
              <AchievementForm enrollmentId={enrollmentId} record={r} />
            )}
          </div>
        ))}
        {!rows.length && <Empty>No achievements recorded.</Empty>}
      </Panel>
    );
  }
  if (tab === "reports") {
    if (!["SUPER_ADMIN", "CLASS_MENTOR"].includes(user.role))
      return (
        <Panel title="Reports">
          <Empty>
            Published consolidated reports are available to class mentors and
            administrators.
          </Empty>
        </Panel>
      );
    const rows = await prisma.reportSnapshot.findMany({
      where: { enrollmentId },
      include: { _count: { select: { downloads: true } } },
      orderBy: { createdAt: "desc" },
    });
    return (
      <Panel title="Approved reports">
        {user.role === "SUPER_ADMIN" && (
          <Modal title="Publish report">
            <ActionForm action={publishReport} label="Publish version">
              <input type="hidden" name="enrollmentId" value={enrollmentId} />
              <Field label="Report">
                <Select className={inputClass} name="kind">
                  {["CONSOLIDATED", "ATTENDANCE", "EXAMS", "PERFORMANCE"].map(
                    (k) => (
                      <option key={k}>{k}</option>
                    ),
                  )}
                </Select>
              </Field>
              <p className="text-sm text-slate-500">
                Includes submitted attendance, final non-demo exams and locked
                evaluations. The published snapshot is permanent.
              </p>
            </ActionForm>
          </Modal>
        )}
        {rows.map((r) => (
          <div
            className="flex justify-between border-b py-3 text-sm"
            key={r.id}
          >
            <span>
              {r.kind} · v{r.version} · {r.createdAt.toISOString().slice(0, 10)}{" "}
              · {r._count.downloads} downloads
            </span>
            <span className="flex gap-2">
              <Link className={linkClass} href={"/dashboard/reports/" + r.id}>
                View / print
              </Link>
              <a className={linkClass} href={"/api/reports/" + r.id}>
                Download data
              </a>
            </span>
          </div>
        ))}
        {!rows.length && <Empty>No reports published.</Empty>}
      </Panel>
    );
  }
  return null;
}
