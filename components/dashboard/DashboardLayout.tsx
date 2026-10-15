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
              ? "group relative flex items-center gap-2.5 rounded-xl bg-emerald-50/80 px-3 py-2 text-sm font-semibold text-emerald-900 border border-emerald-200/60 shadow-2xs transition-all duration-150"
              : "group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-100/70 hover:text-slate-900"
          }
        >
          <span
            className={
              active
                ? "flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs transition-transform"
                : "flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 group-hover:text-slate-700 transition-colors"
            }
          >
            <Icon className="text-base" />
          </span>
          <span className="truncate">{item.label}</span>
          {active && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-600" />
          )}
        </Link>
      );
    });

  const sidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center px-5 border-b border-slate-100 bg-white">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <img
            src="/img/top.png"
            alt="Dihliz World School"
            className="h-8 w-auto max-w-[170px] object-contain transition-opacity duration-200 group-hover:opacity-90"
          />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3.5 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
            <div key={group.name} className="mb-4">
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.name}
              </p>
              <div className="space-y-0.5">{renderNavigation(group.items)}</div>
            </div>
          ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          onClick={logout}
          className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 transition-all duration-150 hover:bg-red-50/80 hover:text-red-600"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 transition-colors group-hover:bg-red-100 group-hover:text-red-600">
            <FiLogOut className="text-sm" />
          </span>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-font min-h-screen bg-[#f8fafc] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] border-r border-slate-200/80 bg-white shadow-[1px_0_10px_rgba(15,23,42,0.02)] lg:block">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-[280px] shadow-2xl">
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-lg bg-slate-100 p-1.5 text-slate-600 transition hover:bg-slate-200"
            >
              <FiX className="text-base" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-[258px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 lg:hidden"
                aria-label="Open menu"
              >
                <FiMenu className="text-lg" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                    {title}
                  </h1>
                  {eyebrow && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {eyebrow}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((value) => !value)}
                  className="group flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-1.5 pr-2.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </span>
                  <div className="hidden text-left sm:block">
                    <span className="block max-w-36 truncate text-xs font-semibold text-slate-900 leading-tight">
                      {currentUser.fullName}
                    </span>
                    <span className="block text-[10px] font-medium text-slate-400 leading-tight">
                      {roleLabel(currentUser.role)}
                    </span>
                  </div>
                  <FiChevronDown className="text-xs text-slate-400 transition-transform duration-150 group-hover:translate-y-0.5" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-60 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-100 z-50">
                    <div className="border-b border-slate-100 px-3 py-2.5">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {currentUser.fullName}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        {currentUser.email}
                      </p>
                    </div>
                    <div className="pt-1">
                      <button
                        onClick={logout}
                        className="group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <FiLogOut className="text-sm transition-transform group-hover:scale-110" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-page-transition mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
