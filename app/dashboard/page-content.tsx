"use client";

import Link from "next/link";
import {
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiSettings,
  FiShield,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { AuthUser } from "@/lib/auth";

type Props = {
  currentUser: AuthUser;
  activeYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    cohorts: Array<{
      id: string;
      displayName: string;
      code: string;
      stream: string | null;
    }>;
  } | null;
  counts: {
    cohorts: number;
    staff: number;
    departments: number;
    activeStaff: number;
  };
};

const metricStyles = [
  { icon: "text-fuchsia-600", surface: "from-fuchsia-50 to-rose-50" },
  { icon: "text-violet-600", surface: "from-violet-50 to-purple-50" },
  { icon: "text-cyan-700", surface: "from-cyan-50 to-sky-50" },
  { icon: "text-[#0b7a4b]", surface: "from-emerald-50 to-green-50" },
];

export default function Dashboard({ currentUser, activeYear, counts }: Props) {
  const cards = [
    {
      label: "Active cohorts",
      value: counts.cohorts,
      note: "Academic groups",
      icon: FiLayers,
    },
    {
      label: "Staff accounts",
      value: counts.staff,
      note: counts.activeStaff + " currently active",
      icon: FiUsers,
    },
    {
      label: "Departments",
      value: counts.departments,
      note: "Configured units",
      icon: FiBookOpen,
    },
    {
      label: "Academic year",
      value: activeYear?.name ?? "Not set",
      note: activeYear ? "Current workspace" : "Needs configuration",
      icon: FiCalendar,
    },
  ];

  const quickActions = [
    {
      label: "Students",
      description: "Profiles, contacts and yearly enrollment",
      href: "/dashboard/students",
      icon: FiUsers,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Examinations",
      description: "Subjects, marks and results",
      href: "/dashboard/exams",
      icon: FiBookOpen,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Academic setup",
      description: "Years, classes and cohorts",
      href: "/dashboard/academic",
      icon: FiSettings,
      color: "bg-violet-50 text-violet-700",
    },
    {
      label: "Staff access",
      description: "Accounts, roles and scope",
      href: "/dashboard/staff",
      icon: FiShield,
      color: "bg-cyan-50 text-cyan-700",
    },
  ];

  const upcoming = [
    { label: "Daily attendance", status: "Next", icon: FiUserCheck },
  ];

  return (
    <DashboardLayout
      currentUser={currentUser}
      title="Dashboard"
      eyebrow={activeYear ? "Academic year " + activeYear.name : "Overview"}
    >
      <section className="rounded-xl bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, note, icon: Icon }, index) => (
            <article
              key={label}
              className={
                "group relative overflow-hidden rounded-xl border border-transparent bg-gradient-to-l p-4 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-200/80 hover:shadow-lg hover:shadow-slate-200/50 " +
                metricStyles[index].surface
              }
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md " +
                    metricStyles[index].icon
                  }
                >
                  <Icon />
                </span>
                <p className="text-sm font-medium text-slate-600 transition-colors duration-200 group-hover:text-slate-900">{label}</p>
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <p className="text-2xl font-bold leading-none text-[#071a33] transition-colors duration-200 group-hover:text-black">
                  {value}
                </p>
                <p className="flex items-center gap-1 text-right text-[11px] font-normal text-slate-500 transition-colors duration-200 group-hover:text-slate-700">
                  <FiCheckCircle className="shrink-0 text-[#0b7a4b] transition-transform duration-300 group-hover:scale-110" /> {note}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.035)] transition-shadow duration-300 hover:shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-[#071a33]">
                Academic cohorts
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Groups available in the active academic year
              </p>
            </div>
            <Link
              href="/dashboard/academic"
              className="group/link inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0b7a4b] transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-800"
            >
              View all <FiArrowRight className="transition-transform duration-200 group-hover/link:translate-x-1" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-5 py-3">Cohort</th>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Stream</th>
                  <th className="px-5 py-3">Setup status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeYear?.cohorts.slice(0, 6).map((cohort, index) => (
                  <tr
                    key={cohort.id}
                    className="group/row transition-all duration-200 hover:bg-emerald-50/30 hover:shadow-[inset_3px_0_0_0_#0b7a4b]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={
                            "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 group-hover/row:scale-105 group-hover/row:shadow-sm " +
                            metricStyles[index % metricStyles.length].icon
                          }
                        >
                          {cohort.displayName.replace("+", "").slice(0, 2)}
                        </span>
                        <span className="font-semibold text-[#071a33] transition-colors duration-200 group-hover/row:text-[#0b7a4b]">
                          {cohort.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-500">
                      {cohort.code}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {cohort.stream ?? "General"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 transition-colors duration-200 group-hover/row:bg-emerald-100 group-hover/row:text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
                        Ready
                      </span>
                    </td>
                  </tr>
                ))}
                {!activeYear?.cohorts.length && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-sm text-slate-400"
                    >
                      No cohorts are configured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.035)] transition-shadow duration-300 hover:shadow-md">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-semibold text-[#071a33]">
                Quick actions
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Open frequently used setup pages
              </p>
            </div>
            <div className="space-y-2.5 p-4">
              {quickActions.map(
                ({ label, description, href, icon: Icon, color }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md hover:shadow-emerald-950/5"
                  >
                    <span
                      className={
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 ease-out group-hover:scale-110 group-hover:shadow-sm " +
                        color
                      }
                    >
                      <Icon className="text-lg" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-[#071a33] transition-colors duration-200 group-hover:text-[#0b7a4b]">
                        {label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-400 transition-colors duration-200 group-hover:text-slate-500">
                        {description}
                      </span>
                    </span>
                    <FiArrowRight className="shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#0b7a4b]" />
                  </Link>
                ),
              )}
            </div>
          </article>

          <article className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#071a33] via-[#0d2a52] to-[#071a33] p-5 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#071a33]/25">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-emerald-400/20" />
            <div className="relative z-10 flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-amber-400 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white/15">
                <FiCalendar />
              </span>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 transition-colors duration-200 group-hover:bg-emerald-400/25">
                Active
              </span>
            </div>
            <p className="relative z-10 mt-5 text-xs font-medium uppercase tracking-[0.16em] text-slate-400 transition-colors duration-200 group-hover:text-slate-300">
              Current academic year
            </p>
            <p className="relative z-10 mt-1 text-2xl font-bold">
              {activeYear?.name ?? "Not configured"}
            </p>
            {activeYear && (
              <p className="relative z-10 mt-2 text-xs text-slate-400 transition-colors duration-200 group-hover:text-slate-300">
                {activeYear.startDate} - {activeYear.endDate}
              </p>
            )}
          </article>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.035)] transition-shadow duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#071a33]">
                Foundation readiness
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Core setup required before daily operations
              </p>
            </div>
            <span className="text-sm font-bold text-[#0b7a4b]">Available</span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-[#0b7a4b] to-emerald-400" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs font-medium">
            {[
              ["Academic structure", true],
              ["Staff access", true],
              ["Database & security", true],
              ["Students & examinations", true],
            ].map(([label, ready]) => (
              <div
                key={String(label)}
                className="group/item flex items-center gap-2 rounded-lg p-1.5 transition-all duration-200 hover:bg-slate-50 hover:pl-2.5"
              >
                {ready ? (
                  <FiCheckCircle className="shrink-0 text-emerald-500 transition-transform duration-200 group-hover/item:scale-110" />
                ) : (
                  <FiClock className="shrink-0 text-amber-500 transition-transform duration-200 group-hover/item:scale-110" />
                )}
                <span
                  className={
                    "transition-colors duration-200 " +
                    (ready
                      ? "text-slate-600 group-hover/item:text-slate-900"
                      : "text-slate-400 group-hover/item:text-slate-600")
                  }
                >
                  {String(label)}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.035)] transition-shadow duration-300 hover:shadow-md">
          <div>
            <h2 className="text-lg font-semibold text-[#071a33]">
              Coming next
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              ERP module implementation queue
            </p>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {upcoming.map(({ label, status, icon: Icon }) => (
              <div
                key={label}
                className="group/item flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-slate-50 hover:translate-x-1"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all duration-200 group-hover/item:scale-110 group-hover/item:bg-white group-hover/item:shadow-sm">
                  <Icon />
                </span>
                <span className="flex-1 text-sm font-medium text-slate-700 transition-colors duration-200 group-hover/item:text-[#071a33]">
                  {label}
                </span>
                <span
                  className={
                    status === "Next"
                      ? "rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase text-amber-700 transition-colors duration-200 group-hover/item:bg-amber-100"
                      : "rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase text-slate-400"
                  }
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
