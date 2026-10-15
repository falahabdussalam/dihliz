"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FiAward,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiChevronDown,
  FiClipboard,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiShield,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useState } from "react";
import type { AuthUser } from "@/lib/auth";
import { roleLabel } from "@/lib/permissions";

type Props = {
  currentUser: AuthUser;
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof FiGrid;
  comingSoon?: boolean;
};

const setupNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: FiGrid },
  { label: "Academic setup", href: "/dashboard/academic", icon: FiSettings },
  { label: "Staff access", href: "/dashboard/staff", icon: FiShield },
];

const moduleNavigation: NavigationItem[] = [
  { label: "Students", href: "/dashboard/students", icon: FiUsers },
  { label: "Attendance", href: "/dashboard/attendance", icon: FiUserCheck },
  { label: "Examinations", href: "/dashboard/exams", icon: FiBookOpen },
  { label: "Performance", href: "/dashboard/performance", icon: FiTrendingUp },
  { label: "Achievements", href: "/dashboard/achievements", icon: FiAward },
  { label: "Reports", href: "/dashboard/reports", icon: FiCalendar },
];

export default function DashboardLayout({
  currentUser,
  title,
  eyebrow = "School ERP",
  children,
}: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  };

  const renderNavigation = (items: NavigationItem[]) =>
    items.map((item) => {
      const active =
        item.href === "/dashboard"
          ? pathname === item.href
          : pathname.startsWith(item.href);
      const Icon = item.icon;

      return (
        <Link
          key={item.href}
          href={item.href}
          prefetch={true}
          onClick={() => setMobileOpen(false)}
          className={
            active
              ? "group relative flex items-center gap-3 rounded-xl bg-emerald-50/90 px-3 py-2.5 text-sm font-semibold text-[#0b7a4b] shadow-[0_1px_3px_rgba(11,122,75,0.08)] transition-all duration-200"
              : "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-emerald-50/60 hover:text-[#0b7a4b] hover:translate-x-1"
          }
        >
          {active && (
            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#0b7a4b]" />
          )}
          <span
            className={
              active
                ? "flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b7a4b] text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
                : "flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all duration-200 group-hover:scale-110 group-hover:bg-[#0b7a4b]/10 group-hover:text-[#0b7a4b]"
            }
          >
            <Icon className="text-base" />
          </span>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            {item.label}
          </span>
        </Link>
      );
    });

  const sidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-[74px] items-center gap-3 border-b border-slate-200 px-10">
        <img
          src="/img/top.png"
          alt="Dihliz World School"
          className="h-auto w-full object-contain"
        />
      </div>

      <nav className="erp-scrollbar flex-1 overflow-y-auto px-4 py-5">
        {[
          {
            name: "Overview",
            items: setupNavigation.filter((i) => i.href === "/dashboard"),
          },
          {
            name: "Students",
            items: moduleNavigation.filter(
              (i) => i.href === "/dashboard/students",
            ),
          },
          {
            name: "School operations",
            items: moduleNavigation
              .filter(
                (i) =>
                  !["/dashboard/students", "/dashboard/reports"].includes(
                    i.href,
                  ),
              )
              .filter(
                (i) =>
                  i.href !== "/dashboard/attendance" ||
                  ["SUPER_ADMIN", "CLASS_MENTOR"].includes(currentUser.role),
              )
              .filter(
                (i) =>
                  i.href !== "/dashboard/performance" ||
                  ["SUPER_ADMIN", "CLASS_MENTOR", "HOSTEL_MENTOR"].includes(
                    currentUser.role,
                  ),
              ),
          },
          {
            name: "Reporting",
            items: ["SUPER_ADMIN", "CLASS_MENTOR"].includes(currentUser.role)
              ? moduleNavigation.filter((i) => i.href === "/dashboard/reports")
              : [],
          },
          {
            name: "Administration",
            items:
              currentUser.role === "SUPER_ADMIN"
                ? setupNavigation.filter((i) => i.href !== "/dashboard")
                : [],
          },
        ]
          .filter((g) => g.items.length)
          .map((group) => (
            <div key={group.name} className="mb-5">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {group.name}
              </p>
              <div className="space-y-1">{renderNavigation(group.items)}</div>
            </div>
          ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          onClick={logout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:translate-x-1"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 transition-all duration-200 group-hover:scale-110 group-hover:bg-red-100 group-hover:text-red-600">
            <FiLogOut />
          </span>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            Sign out
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-font min-h-screen bg-[#f5f6fa] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] border-r border-slate-200 shadow-[4px_0_18px_rgba(15,23,42,0.03)] lg:block">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-[#071a33]/55 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-[280px] shadow-2xl">
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-lg bg-slate-100 p-2 text-slate-600 transition-all duration-200 hover:bg-slate-200 hover:rotate-90"
            >
              <FiX />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-[258px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-[74px] items-center gap-3 px-4 py-3 sm:px-6 xl:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-[#0b7a4b] lg:hidden"
              aria-label="Open menu"
            >
              <FiMenu className="text-lg" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-[#071a33] sm:text-2xl">
                {title}
              </h1>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Dashboard <span className="mx-1 text-slate-300">/</span>{" "}
                <span className="text-[#0b7a4b]">{eyebrow}</span>
              </p>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((value) => !value)}
                  className="group flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50/80 hover:shadow-sm sm:gap-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#071a33] text-sm font-bold text-white ring-2 ring-slate-100 transition-all duration-200 group-hover:scale-105 group-hover:ring-emerald-400/40">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block max-w-36 truncate text-sm font-semibold text-[#071a33] transition-colors duration-200 group-hover:text-[#0b7a4b]">
                      {currentUser.fullName}
                    </span>
                    <span className="block text-[11px] font-medium text-slate-400">
                      {roleLabel(currentUser.role)}
                    </span>
                  </span>
                  <FiChevronDown className="hidden text-slate-400 transition-transform duration-200 group-hover:translate-y-0.5 sm:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="truncate text-sm font-semibold text-[#071a33]">
                        {currentUser.fullName}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {currentUser.email}
                      </p>
                    </div>
                    <button
                      onClick={logout}
                      className="group mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all duration-150 hover:bg-red-50 hover:translate-x-0.5"
                    >
                      <FiLogOut className="transition-transform duration-150 group-hover:scale-110" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-page-transition mx-auto max-w-[1600px] p-4 sm:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
