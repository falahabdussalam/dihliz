import Link from "next/link";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiLayers,
  FiSettings,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { schoolScope } from "@/lib/school-access";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default async function Page() {
  const user = await requirePageUser("/dashboard");
  const year = await prisma.academicYear.findFirst({
    where: { isActive: true, isArchived: false },
  });

  const scope = await schoolScope(user, year?.id ?? "");
  const cohortId = { in: scope.cohorts.map((c) => c.id) };

  const [students, exams, attendance] = await Promise.all([
    prisma.studentEnrollment.count({
      where: { cohortId, status: "ACTIVE", student: { isArchived: false } },
    }),
    prisma.exam.count({
      where: { cohortId, isArchived: false, event: { isDemo: false } },
    }),
    prisma.attendanceRegister.count({ where: { cohortId, status: "DRAFT" } }),
  ]);

  const operations = [
    {
      label: "Students",
      href: "/dashboard/students",
      icon: FiUsers,
      desc: "Directory, student profiles, and cohort enrollments",
      badge: "Core",
    },
    {
      label: "Examinations",
      href: "/dashboard/exams",
      icon: FiBookOpen,
      desc: "Assessments, test schedules, and mark entries",
      badge: "Academic",
    },
    ...(["SUPER_ADMIN", "CLASS_MENTOR"].includes(user.role)
      ? [
          {
            label: "Attendance",
            href: "/dashboard/attendance",
            icon: FiUserCheck,
            desc: "Daily roll calls, session registers, and logs",
            badge: "Daily",
          },
          {
            label: "Reports",
            href: "/dashboard/reports",
            icon: FiCalendar,
            desc: "Consolidated grade cards, analytics, and exports",
            badge: "Analytics",
          },
        ]
      : []),
    ...(["SUPER_ADMIN", "CLASS_MENTOR", "HOSTEL_MENTOR"].includes(user.role)
      ? [
          {
            label: "Performance",
            href: "/dashboard/performance",
            icon: FiTrendingUp,
            desc: "Student growth metrics, rankings, and trends",
            badge: "Metrics",
          },
        ]
      : []),
    {
      label: "Achievements",
      href: "/dashboard/achievements",
      icon: FiAward,
      desc: "Honours, sports accolades, and commendations",
      badge: "Laurels",
    },
  ];

  return (
    <DashboardLayout
      currentUser={user}
      title="Dashboard"
      eyebrow={year?.name ?? "No active year"}
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Active Students */}
          <Link
            href={`/dashboard/students?year=${year?.id ?? ""}`}
            prefetch={true}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Active Students
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <FiUsers className="text-lg" />
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-emerald-700">
                {students.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Enrolled in active cohorts
              </p>
            </div>
          </Link>

          {/* Examinations */}
          <Link
            href={`/dashboard/exams?year=${year?.id ?? ""}`}
            prefetch={true}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Examinations
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <FiBookOpen className="text-lg" />
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-blue-700">
                {exams.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Live exams (excluding DEMO)
              </p>
            </div>
          </Link>

          {/* Attendance Drafts */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Attendance Drafts
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                <FiClock className="text-lg" />
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-amber-700">
                {attendance.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {attendance === 0
                  ? "All registers submitted"
                  : "Pending mentor review"}
              </p>
            </div>
          </div>
        </div>

        {/* School Operations */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              School Operations
            </h2>
            <p className="text-xs text-slate-500">
              Core administrative modules and student record workflows
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {operations.map((op) => {
              const Icon = op.icon;
              return (
                <Link
                  key={op.href}
                  href={`${op.href}?year=${year?.id ?? ""}`}
                  prefetch={true}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-200/60 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200/80">
                      <Icon className="text-lg" />
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-all group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <FiArrowUpRight className="text-base" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {op.label}
                      </h3>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                        {op.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {op.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Academic Structure */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all duration-150">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <FiLayers className="text-sm" />
                </span>
                <h2 className="text-base font-bold tracking-tight text-slate-900">
                  Academic Structure
                </h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Classes combine a level, optional division and stream. Subjects belong to departments and are assigned across classes. Houses are yearly student assignments.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-medium text-slate-600">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                  Academic Year
                </span>
                <span className="text-slate-400">→</span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                  Yearly Class
                </span>
                <span className="text-slate-400">→</span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                  Department & Subjects
                </span>
                <span className="text-slate-400">→</span>
                <span className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold px-2.5 py-1">
                  Active Enrollment
                </span>
              </div>
            </div>
            {scope.admin && (
              <div className="shrink-0">
                <Link
                  href="/dashboard/academic"
                  prefetch={true}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-slate-800 hover:shadow-xs active:scale-98"
                >
                  <FiSettings className="text-sm" />
                  <span>Manage Academic Setup</span>
                  <FiArrowRight className="text-xs opacity-70" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
