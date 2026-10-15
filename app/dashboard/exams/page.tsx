import ExamStatus from "@/components/dashboard/ExamStatus";
import { importExamination } from "@/features/examinations/import-action";
import Select from "@/components/dashboard/Select";
import Popover from "@/components/dashboard/Popover";
import Pagination from "@/components/dashboard/Pagination";
import { examDay } from "@/lib/exam-lifecycle";
import Modal from "@/components/dashboard/Dialog";
import ExamSearch from "./ExamSearch";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import { schoolScope } from "@/lib/school-access";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ActionForm from "@/components/dashboard/ActionForm";
import {
  Panel,
  Field,
  Empty,
  inputClass,
  linkClass,
} from "@/components/dashboard/SchoolUI";
import ExamsViewToggle from "./ExamViewToggle";

export const metadata = { title: "Examinations - Dihliz" };

export default async function Exams({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    cohort?: string;
    status?: string;
    sort?: string;
    visibility?: string;
    q?: string;
    page?: string;
    archived?: string;
    view?: string;
  }>;
}) {
  const filters = await searchParams;
  const [user, years] = await Promise.all([
    requirePageUser("/dashboard/exams"),
    prisma.academicYear.findMany({
      where: { isArchived: false },
      select: { id: true, name: true, startDate: true, endDate: true },
      orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
    }),
  ]);

  const year = filters.year
    ? years.find((y) => y.id === filters.year)
    : years[0];

  const scope = await schoolScope(user, year?.id ?? "");

  const today = examDay();
  const publicWhere = {
    isArchived: false,
    resultsPublic: true,
    status: { in: ["FINAL", "LOCKED"] as ("FINAL" | "LOCKED")[] },
    publishDate: { lte: today },
  };
  const unpublishedWhere = {
    OR: [
      { resultsPublic: false },
      { status: "DRAFT" as const },
      { publishDate: null },
      { publishDate: { gt: today } },
      { isArchived: true },
    ],
  };
  const stageWhere =
    filters.status === "Scheduled"
      ? { date: { gt: today } }
      : filters.status === "Ongoing"
        ? {
            date: { lte: today },
            status: "DRAFT" as const,
            OR: [
              { markEntryDueDate: null },
              { markEntryDueDate: { gte: today } },
            ],
          }
        : filters.status === "Locked"
          ? {
              date: { lte: today },
              OR: [
                {
                  status: { in: ["FINAL", "LOCKED"] as ("FINAL" | "LOCKED")[] },
                },
                { markEntryDueDate: { lt: today } },
              ],
            }
          : filters.status === "Published"
            ? publicWhere
            : filters.status === "Unpublished"
              ? unpublishedWhere
              : {};

  const where = {
    isArchived: scope.admin && filters.archived === "1",
    cohortId: {
      in: scope.cohorts
        .filter((c) => !filters.cohort || c.id === filters.cohort)
        .map((c) => c.id),
    },
    AND: [
      stageWhere,
      ...(filters.visibility === "public"
        ? [{ resultsPublic: true }]
        : filters.visibility === "private"
          ? [{ resultsPublic: false }]
          : []),
    ],
    ...(filters.q
      ? {
          title: {
            contains: filters.q.slice(0, 120),
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(!scope.admin && user.role !== "CLASS_MENTOR"
      ? {
          subjects: {
            some:
              user.role === "SUBJECT_TUTOR"
                ? { markingTutorId: user.id }
                : {
                    cohortSubject: {
                      subject: { departmentId: { in: scope.departmentIds } },
                    },
                  },
          },
        }
      : {}),
  };

  const requestedPage = Math.min(
    1000000,
    Math.max(1, Number.parseInt(filters.page ?? "1") || 1),
  );
  const listQuery = (page: number) =>
    prisma.exam.findMany({
      where,
      select: {
        id: true,
        title: true,
        date: true,
        markEntryDueDate: true,
        publishDate: true,
        status: true,
        resultsPublic: true,
        isArchived: true,
        event: {
          select: {
            isDemo: true,
            _count: {
              select: {
                exams: {
                  where: { cohortId: { in: scope.cohorts.map((c) => c.id) } },
                },
              },
            },
          },
        },
        cohort: { select: { displayName: true } },
        _count: { select: { subjects: true, candidates: true } },
      },
      orderBy:
        filters.sort === "name"
          ? [{ title: "asc" }, { id: "asc" }]
          : filters.sort === "name-desc"
            ? [{ title: "desc" }, { id: "desc" }]
            : filters.sort === "oldest"
              ? [{ date: "asc" }, { id: "asc" }]
              : [{ date: "desc" }, { id: "desc" }],
      take: 20,
      skip: (page - 1) * 20,
    });
  const [total, requestedExams] = await Promise.all([
    prisma.exam.count({ where }),
    listQuery(requestedPage),
  ]);
  const page = Math.min(Math.max(1, Math.ceil(total / 20)), requestedPage);
  const exams = page === requestedPage ? requestedExams : await listQuery(page);

  const isGridView = filters.view === "grid";

  return (
    <DashboardLayout
      currentUser={user}
      title="Examinations"
      eyebrow={year?.name ?? "Academic year"}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ExamSearch key={filters.q ?? ""} query={filters.q ?? ""} />
          <div className="flex flex-wrap items-start gap-3">
            <Popover label="Filter" title="Filter exams" align="start">
              <form className="mt-4 flex flex-col gap-4 [&>label>span]:uppercase [&>label>span]:tracking-wide">
                <Field label="Academic year">
                  <Select
                    className={inputClass}
                    name="year"
                    defaultValue={year?.id}
                  >
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Class">
                  <Select
                    className={inputClass}
                    name="cohort"
                    defaultValue={filters.cohort ?? ""}
                  >
                    <option value="">All accessible classes</option>
                    {scope.cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.displayName}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Status">
                  <Select
                    className={inputClass}
                    name="status"
                    defaultValue={filters.status ?? ""}
                  >
                    <option value="">All statuses</option>
                    {[
                      "Scheduled",
                      "Ongoing",
                      "Locked",
                      "Published",
                      "Unpublished",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Result visibility">
                  <Select
                    name="visibility"
                    defaultValue={filters.visibility ?? ""}
                    className={inputClass}
                  >
                    <option value="">All results</option>
                    <option value="public">Public results</option>
                    <option value="private">Private results</option>
                  </Select>
                </Field>
                <input type="hidden" name="q" value={filters.q ?? ""} />
                <div className="flex items-end gap-2">
                  <input
                    type="hidden"
                    name="view"
                    value={filters.view ?? "list"}
                  />
                  <input
                    type="hidden"
                    name="sort"
                    value={filters.sort ?? "newest"}
                  />
                </div>
                {scope.admin && (
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="archived"
                      value="1"
                      defaultChecked={filters.archived === "1"}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Archived exams
                  </label>
                )}
                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <Link
                    className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-500 hover:text-red-600"
                    href={
                      "/dashboard/exams?" +
                      new URLSearchParams({
                        year: year?.id ?? "",
                        q: filters.q ?? "",
                        sort: filters.sort ?? "newest",
                        view: filters.view ?? "list",
                      })
                    }
                  >
                    Reset filters
                  </Link>
                  <button className={linkClass}>Apply filters</button>
                </div>
              </form>
            </Popover>
            <Popover label="Sort" title="Sort options" width="w-56">
              <div
                role="menu"
                aria-label="Sort options"
                className="mt-3 space-y-1"
              >
                {[
                  { value: "newest", label: "Newest first" },
                  { value: "oldest", label: "Oldest first" },
                  { value: "name", label: "Name A–Z" },
                  { value: "name-desc", label: "Name Z–A" },
                ].map((option) => (
                  <Link
                    key={option.value}
                    prefetch={false}
                    role="menuitem"
                    aria-current={
                      (filters.sort ?? "newest") === option.value
                        ? "true"
                        : undefined
                    }
                    className={
                      "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold " +
                      ((filters.sort ?? "newest") === option.value
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-700 hover:bg-slate-50")
                    }
                    href={
                      "/dashboard/exams?" +
                      new URLSearchParams({
                        ...(Object.fromEntries(
                          Object.entries(filters).filter(
                            ([key, value]) =>
                              key !== "page" && typeof value === "string",
                          ),
                        ) as Record<string, string>),
                        sort: option.value,
                      })
                    }
                  >
                    {option.label}
                    {(filters.sort ?? "newest") === option.value && (
                      <span aria-hidden>✓</span>
                    )}
                  </Link>
                ))}
              </div>
            </Popover>

            <Popover label="Export" title="Export examination">
              <p className="mt-3 text-xs text-slate-500">
                Choose an examination from this page.
              </p>
              <ul className="mt-3 space-y-3">
                {exams.map((e) => (
                  <li key={e.id} className="border-b pb-3 text-sm">
                    <p className="font-semibold">
                      {e.title} · {e.cohort.displayName}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <a
                        className={linkClass}
                        href={"/api/exams/" + e.id + "/export"}
                      >
                        Results CSV
                      </a>
                      {scope.admin && (
                        <a
                          className={linkClass}
                          href={"/api/exams/" + e.id + "/configuration"}
                        >
                          Configuration JSON
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {!exams.length && (
                <p className="mt-3 text-sm">No examinations to export.</p>
              )}
            </Popover>
            {scope.admin && year && (
              <Modal title="Import examination">
                <ActionForm
                  action={importExamination}
                  label="Import examination"
                >
                  <input type="hidden" name="yearId" value={year.id} />
                  <Field label="Configuration JSON">
                    <input
                      type="file"
                      name="configuration"
                      accept=".json,application/json"
                      required
                    />
                  </Field>
                  <p className="text-sm text-slate-500">
                    Import an exported examination configuration for this
                    academic year. Creates a new private examination with the
                    selected subject settings and current student roster. Marks
                    are not imported.
                  </p>
                </ActionForm>
              </Modal>
            )}
            <ExamsViewToggle currentView={filters.view ?? "list"} />
            {scope.admin && year && (
              <Link
                href={"/dashboard/exams/create?year=" + year.id}
                prefetch={false}
                className="rounded-lg bg-[#0b7a4b] px-4 py-2 text-sm font-semibold text-white"
              >
                Create examination
              </Link>
            )}
          </div>
        </div>

        <Panel title="Exams and marks">
          {!isGridView && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="border-b bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    {[
                      "Exam",
                      "Class",
                      "Date",
                      "Subjects",
                      "Students",
                      "Status",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="group/row transition-all duration-200 hover:bg-emerald-50/25 hover:shadow-[inset_3px_0_0_0_#0b7a4b]"
                    >
                      <td className="px-4 py-3">
                        <Link
                          className="font-semibold text-emerald-700 transition-colors duration-150 hover:text-emerald-900 hover:underline"
                          prefetch={false}
                          href={"/dashboard/exams/" + exam.id}
                        >
                          {exam.title}
                        </Link>
                        {exam.event && (
                          <p className="mt-1 text-xs text-slate-500">
                            {exam.event._count.exams} participating classes
                            {exam.event.isDemo ? " · DEMO" : ""}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {exam.cohort.displayName}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {exam.date.toISOString().slice(0, 10)}
                        <span className="mt-1 block text-xs text-slate-500">
                          Entry due:{" "}
                          {exam.markEntryDueDate?.toISOString().slice(0, 10) ??
                            "—"}
                          <br />
                          Publish:{" "}
                          {exam.publishDate?.toISOString().slice(0, 10) ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {exam._count.subjects}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {exam._count.candidates}
                      </td>
                      <td className="px-4 py-3">
                        <ExamStatus exam={exam} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!exams.length && (
                <Empty>
                  No exams yet. Select a cohort to create its first examination.
                </Empty>
              )}
            </div>
          )}

          {isGridView && (
            <div>
              {exams.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {exams.map((exam) => (
                    <Link
                      key={exam.id}
                      prefetch={false}
                      href={"/dashboard/exams/" + exam.id}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
                    >
                      <div>
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <h3 className="text-base font-semibold text-slate-800 transition-colors duration-200 group-hover:text-[#0b7a4b]">
                            {exam.title}
                          </h3>
                          <ExamStatus exam={exam} />
                        </div>
                        <p className="mb-2 text-xs text-slate-500">
                          Visibility:{" "}
                          {exam.resultsPublic ? "Public" : "Private"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {exam.cohort.displayName}
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Date
                            </p>
                            <p className="mt-0.5 font-medium text-slate-700">
                              {exam.date.toISOString().slice(0, 10)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Subjects
                            </p>
                            <p className="mt-0.5 font-medium text-slate-700">
                              {exam._count.subjects}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Students
                            </p>
                            <p className="mt-0.5 font-medium text-slate-700">
                              {exam._count.candidates}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Entry due
                            </p>
                            <p className="mt-0.5 font-medium text-slate-700">
                              {exam.markEntryDueDate
                                ?.toISOString()
                                .slice(0, 10) ?? "—"}
                            </p>
                          </div>
                        </div>
                        {exam.event && (
                          <p className="mt-3 text-xs text-slate-400">
                            {exam.event._count.exams} participating classes
                            {exam.event.isDemo ? " · DEMO" : ""}
                          </p>
                        )}
                      </div>
                      <div className="mt-5 flex items-center text-xs font-semibold text-emerald-600 opacity-0 transition group-hover:opacity-100">
                        Open exam →
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Empty>
                  No exams yet. Select a cohort to create its first examination.
                </Empty>
              )}
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / 20)}
            total={total}
          />
        </Panel>
      </div>
    </DashboardLayout>
  );
}
