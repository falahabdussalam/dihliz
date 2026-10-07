"use client";
import Select from "@/components/dashboard/Select";

import EditStructure from "@/features/academics/EditStructure";
import Link from "next/link";
import ConfirmButton from "@/components/dashboard/ConfirmButton";
import { Dialog } from "@/components/dashboard/Dialog";
import AcademicTabs from "@/features/academics/Tabs";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiBook, FiCalendar, FiCheck, FiLayers, FiPlus } from "react-icons/fi";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { AuthUser } from "@/lib/auth";
import { canManageAcademicSetup } from "@/lib/permissions";

type Cohort = {
  updatedAt: string;
  isArchived: boolean;
  id: string;
  code: string;
  displayName: string;
  classLevel: { id: string; name: string };
  division: { id: string; name: string } | null;
  stream: { id: string; name: string } | null;
};

type Year = {
  updatedAt: string;
  isArchived: boolean;
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  cohorts: Cohort[];
};

type Option = { id: string; name: string; code: string };

type Props = {
  currentUser: AuthUser;
  years: Year[];
  classLevels: Option[];
  divisions: Option[];
  streams: Option[];
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export default function AcademicSetup({
  currentUser,
  years,
  classLevels,
  divisions,
  streams,
}: Props) {
  const router = useRouter();
  const canManage = currentUser.role === "SUPER_ADMIN";
  const activeYear = useMemo(
    () => years.find((year) => year.isActive) ?? years[0] ?? null,
    [years],
  );
  const search = useSearchParams();
  const selectedYearId = search.get("year") ?? activeYear?.id ?? "";
  const setSelectedYearId = (id: string) =>
    router.push("/dashboard/academic?year=" + id);
  const selectedYear =
    years.find((year) => year.id === selectedYearId) ?? activeYear;
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showYearForm, setShowYearForm] = useState(false);
  const [showCohortForm, setShowCohortForm] = useState(false);

  const submitAction = async (payload: unknown) => {
    setSaving(true);
    setNotice(null);

    try {
      const response = await fetch("/api/academic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        setNotice({
          type: "error",
          text: result.message ?? "Unable to save changes.",
        });
        return false;
      }

      setNotice({
        type: "success",
        text: "Academic setup updated successfully.",
      });
      router.refresh();
      return true;
    } catch {
      setNotice({ type: "error", text: "Unable to reach the server." });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const createYear = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const saved = await submitAction({
      action: "createYear",
      name: form.get("name"),
      startDate: form.get("startDate"),
      endDate: form.get("endDate"),
      makeActive: form.get("makeActive") === "on",
    });
    if (saved) setShowYearForm(false);
  };

  const createCohort = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const saved = await submitAction({
      action: "createCohort",
      academicYearId: selectedYearId,
      code: form.get("code"),
      displayName: form.get("displayName"),
      classLevelId: form.get("classLevelId"),
      divisionId: form.get("divisionId") || null,
      streamId: form.get("streamId") || null,
    });
    if (saved) setShowCohortForm(false);
  };

  return (
    <DashboardLayout
      currentUser={currentUser}
      title="Academic setup"
      eyebrow="Academic structure"
    >
      <div className="mb-6">
        <AcademicTabs active="years" year={selectedYear?.id} />
        <Link
          className="mt-3 inline-block text-sm text-emerald-700"
          href={
            "/dashboard/academic?year=" +
            selectedYearId +
            (search.get("archived") === "1" ? "" : "&archived=1")
          }
        >
          {search.get("archived") === "1"
            ? "Hide archived records"
            : "Show archived records for recovery"}
        </Link>
      </div>
      {notice && (
        <div
          className={
            notice.type === "success"
              ? "mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
              : "mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          }
        >
          {notice.text}
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-3">
        <SummaryCard
          icon={<FiCalendar />}
          label="Academic years"
          value={years.length}
          color="bg-blue-50 text-blue-700"
        />
        <SummaryCard
          icon={<FiLayers />}
          label="Current classes"
          value={activeYear?.cohorts.length ?? 0}
          color="bg-emerald-50 text-emerald-700"
        />
        <SummaryCard
          icon={<FiBook />}
          label="Available streams"
          value={streams.length}
          color="bg-violet-50 text-violet-700"
        />
      </section>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#071a33]">
              Academic years
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose the active year used across attendance, marks and reports.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowYearForm((value) => !value)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#071a33] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <FiPlus /> New academic year
            </button>
          )}
        </div>

        {showYearForm && (
          <Dialog
            title="New academic year"
            open={showYearForm}
            onClose={() => setShowYearForm(false)}
          >
            <form
              data-pending={saving}
              onSubmit={createYear}
              className="grid gap-4 border-b border-slate-200 bg-slate-50 p-6 sm:grid-cols-2"
            >
              {notice?.type === "error" && (
                <p role="alert" className="text-red-700 sm:col-span-2">
                  {notice.text}
                </p>
              )}
              <FormField label="Year name">
                <input
                  name="name"
                  required
                  placeholder="2027-2028"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Start date">
                <input
                  name="startDate"
                  type="date"
                  required
                  className={inputClass}
                />
              </FormField>
              <FormField label="End date">
                <input
                  name="endDate"
                  type="date"
                  required
                  className={inputClass}
                />
              </FormField>
              <div className="flex items-end gap-3">
                <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input name="makeActive" type="checkbox" /> Make active
                </label>
                <button
                  disabled={saving}
                  className="mb-1 ml-auto rounded-lg bg-[#0b7a4b] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Save
                </button>
              </div>
            </form>
          </Dialog>
        )}

        <div className="divide-y divide-slate-100">
          {years.map((year) => (
            <div
              key={year.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
            >
              <button
                onClick={() => setSelectedYearId(year.id)}
                className="flex flex-1 items-center gap-4 text-left"
              >
                <span
                  className={
                    year.isActive
                      ? "flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"
                      : "flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
                  }
                >
                  {year.isActive ? <FiCheck /> : <FiCalendar />}
                </span>
                <span>
                  <span className="flex items-center gap-2 font-semibold text-[#071a33]">
                    {year.name}
                    {year.isActive && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] uppercase text-emerald-700">
                        Active
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {year.startDate} to {year.endDate} | {year.cohorts.length}{" "}
                    classes
                  </span>
                </span>
              </button>
              {canManage && (
                <EditStructure
                  kind="year"
                  id={year.id}
                  name={year.name}
                  updatedAt={year.updatedAt}
                  archived={year.isArchived}
                />
              )}
              {canManage && !year.isActive && (
                <ConfirmButton
                  disabled={saving}
                  label="Set active"
                  description={
                    "Make " + year.name + " the active academic year?"
                  }
                  onConfirm={() =>
                    submitAction({ action: "setActiveYear", id: year.id })
                  }
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#071a33]">
              {selectedYear?.name ?? "No year"} classes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Class, optional division and optional stream combinations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={selectedYearId}
              onChange={(event) => setSelectedYearId(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
            >
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </Select>
            {canManage && selectedYear && (
              <button
                onClick={() => setShowCohortForm((value) => !value)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0b7a4b] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <FiPlus /> Add class
              </button>
            )}
          </div>
        </div>

        {showCohortForm && selectedYear && (
          <Dialog
            title="Add class"
            open={showCohortForm}
            onClose={() => setShowCohortForm(false)}
          >
            <form
              data-pending={saving}
              onSubmit={createCohort}
              className="grid gap-4 border-b border-slate-200 bg-slate-50 p-6 sm:grid-cols-2"
            >
              {notice?.type === "error" && (
                <p role="alert" className="text-red-700 sm:col-span-2">
                  {notice.text}
                </p>
              )}
              <FormField label="Code">
                <input
                  name="code"
                  required
                  placeholder="9-C"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Display name">
                <input
                  name="displayName"
                  required
                  placeholder="9C"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Class">
                <Select name="classLevelId" required className={inputClass}>
                  <option value="">Select</option>
                  {classLevels.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Division">
                <Select name="divisionId" className={inputClass}>
                  <option value="">None</option>
                  {divisions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Stream">
                <Select name="streamId" className={inputClass}>
                  <option value="">None</option>
                  {streams.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <div className="flex items-end">
                <button
                  disabled={saving}
                  className="w-full rounded-lg bg-[#0b7a4b] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Save class
                </button>
              </div>
            </form>
          </Dialog>
        )}

        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
          {selectedYear?.cohorts.map((cohort) => (
            <article
              key={cohort.id}
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-300 hover:shadow-sm"
            >
              {canManage && (
                <div className="mb-3 flex justify-end">
                  <EditStructure
                    kind="class"
                    id={cohort.id}
                    name={cohort.displayName}
                    updatedAt={cohort.updatedAt}
                    archived={cohort.isArchived}
                  />
                </div>
              )}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold text-[#071a33]">
                    {cohort.displayName}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                    {cohort.code}
                  </p>
                </div>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {cohort.classLevel.name}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
                {cohort.division && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                    {cohort.division.name}
                  </span>
                )}
                {cohort.stream && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                    {cohort.stream.name}
                  </span>
                )}
                {!cohort.division && !cohort.stream && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                    General cohort
                  </span>
                )}
              </div>
            </article>
          ))}
          {!selectedYear?.cohorts.length && (
            <p className="col-span-full py-10 text-center text-sm text-slate-500">
              No classes configured for this year.
            </p>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <article className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
      <span
        className={
          "flex h-12 w-12 items-center justify-center rounded-xl " + color
        }
      >
        {icon}
      </span>
      <span>
        <strong className="block text-2xl font-semibold text-[#071a33]">
          {value}
        </strong>
        <span className="text-sm font-normal text-slate-500">{label}</span>
      </span>
    </article>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
