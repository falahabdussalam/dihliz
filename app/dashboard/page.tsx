import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { schoolScope } from "@/lib/school-access";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Panel, Stats, linkClass } from "@/components/dashboard/SchoolUI";
export default async function Page() {
  const user = await requirePageUser("/dashboard"),
    year = await prisma.academicYear.findFirst({
      where: { isActive: true, isArchived: false },
    });
  const scope = await schoolScope(user, year?.id ?? ""),
    cohortId = { in: scope.cohorts.map((c) => c.id) };
  const [students, exams, attendance] = await Promise.all([
    prisma.studentEnrollment.count({
      where: { cohortId, status: "ACTIVE", student: { isArchived: false } },
    }),
    prisma.exam.count({
      where: { cohortId, isArchived: false, event: { isDemo: false } },
    }),
    prisma.attendanceRegister.count({ where: { cohortId, status: "DRAFT" } }),
  ]);
  const links = [
    ["Students", "/dashboard/students"],
    ["Examinations", "/dashboard/exams"],
    ...(["SUPER_ADMIN", "CLASS_MENTOR"].includes(user.role)
      ? [
          ["Attendance", "/dashboard/attendance"],
          ["Reports", "/dashboard/reports"],
        ]
      : []),
    ...(["SUPER_ADMIN", "CLASS_MENTOR", "HOSTEL_MENTOR"].includes(user.role)
      ? [["Performance", "/dashboard/performance"]]
      : []),
    ["Achievements", "/dashboard/achievements"],
  ];
  return (
    <DashboardLayout
      currentUser={user}
      title="Dashboard"
      eyebrow={year?.name ?? "No active year"}
    >
      <div className="space-y-6">
        <Stats
          items={[
            { label: "Active students", value: students },
            { label: "Examinations (excluding DEMO)", value: exams },
            { label: "Attendance drafts", value: attendance },
          ]}
        />
        <Panel title="School operations">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map(([label, href]) => (
              <Link
                key={href}
                className={linkClass + " justify-between p-5"}
                href={href + "?year=" + (year?.id ?? "")}
              >
                {label}
                <span>→</span>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel title="Academic structure">
          <p className="text-sm text-slate-600">
            Academic year → yearly class → enrollment. Classes combine a level,
            optional division and stream. Subjects belong to departments and can
            be assigned across classes. Houses are yearly student assignments.
          </p>
          {scope.admin && (
            <Link className={linkClass + " mt-4"} href="/dashboard/academic">
              Manage academic setup
            </Link>
          )}
        </Panel>
      </div>
    </DashboardLayout>
  );
}
