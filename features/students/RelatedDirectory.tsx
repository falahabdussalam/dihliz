import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { studentQuery } from "@/lib/student-queries";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Panel,
  Field,
  Empty,
  inputClass,
  linkClass,
} from "@/components/dashboard/SchoolUI";
import AchievementForm from "@/features/achievements/Form";
export default async function RelatedDirectory({
  kind,
  filters,
}: {
  kind: "achievements" | "reports";
  filters: Record<string, string | undefined>;
}) {
  const user = await requirePageUser("/dashboard/" + kind),
    { year, years, scope, where } = await studentQuery(user, filters);
  const page = Math.max(1, parseInt(filters.page ?? "1") || 1);
  const total = await prisma.studentEnrollment.count({ where });
  const rows = await prisma.studentEnrollment.findMany({
    where,
    include: {
      student: { select: { fullName: true, studentNumber: true } },
      cohort: true,
      _count: {
        select: {
          achievements: { where: { isArchived: false } },
          reports: true,
        },
      },
    },
    orderBy: { student: { fullName: "asc" } },
    take: 25,
    skip: (page - 1) * 25,
  });
  const archived =
    kind === "achievements" && filters.recovery === "1"
      ? await prisma.achievement.findMany({
          where: { isArchived: true, enrollment: where },
          include: { enrollment: { include: { student: true } } },
          take: 100,
          orderBy: { date: "desc" },
        })
      : [];
  const url = (n: number) =>
    "?" +
    new URLSearchParams({
      ...Object.fromEntries(
        Object.entries(filters).filter((e): e is [string, string] => !!e[1]),
      ),
      page: String(n),
    });
  return (
    <DashboardLayout
      currentUser={user}
      title={kind === "achievements" ? "Achievements" : "Reports"}
      eyebrow={year?.name}
    >
      <Panel
        title={
          kind === "achievements" ? "Student achievements" : "Student reports"
        }
      >
        <form className="mb-5 flex flex-wrap items-end gap-3">
          <Field label="Academic year">
            <select className={inputClass} name="year" defaultValue={year?.id}>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Class">
            <select
              className={inputClass}
              name="cohort"
              defaultValue={filters.cohort}
            >
              <option value="">All accessible classes</option>
              {scope.cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Student">
            <input className={inputClass} name="q" defaultValue={filters.q} />
          </Field>
          {kind === "achievements" && (
            <label className="text-sm">
              <input
                type="checkbox"
                name="recovery"
                value="1"
                defaultChecked={filters.recovery === "1"}
              />{" "}
              Archived achievements
            </label>
          )}
          <button className={linkClass}>Apply filters</button>
        </form>
        {filters.recovery === "1"
          ? archived.map((a) => (
              <div key={a.id} className="flex justify-between border-b py-3">
                <span>
                  {a.enrollment.student.fullName} · {a.title}
                </span>
                {["SUPER_ADMIN", "CLASS_MENTOR"].includes(user.role) && (
                  <AchievementForm enrollmentId={a.enrollmentId} record={a} />
                )}
              </div>
            ))
          : rows.map((e) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 border-b py-3 text-sm"
                key={e.id}
              >
                <Link
                  className="font-semibold text-emerald-700"
                  href={
                    "/dashboard/students/" +
                    e.studentId +
                    "?year=" +
                    e.academicYearId +
                    "&tab=" +
                    kind
                  }
                >
                  {e.student.fullName}
                  <span className="block text-xs font-normal text-slate-500">
                    {e.student.studentNumber} · {e.cohort.displayName}
                  </span>
                </Link>
                <span>
                  {kind === "achievements"
                    ? e._count.achievements + " achievements"
                    : e._count.reports + " published reports"}
                </span>
                {kind === "achievements" &&
                  ["SUPER_ADMIN", "CLASS_MENTOR"].includes(user.role) && (
                    <AchievementForm enrollmentId={e.id} />
                  )}
              </div>
            ))}
        {!rows.length && <Empty>No students in this view.</Empty>}
        <div className="mt-5 flex justify-between">
          <Link className={linkClass} href={url(Math.max(1, page - 1))}>
            Previous
          </Link>
          <span className="text-sm">
            Page {page} · {total} students
          </span>
          {page * 25 < total && (
            <Link className={linkClass} href={url(page + 1)}>
              Next
            </Link>
          )}
        </div>
      </Panel>
    </DashboardLayout>
  );
}
