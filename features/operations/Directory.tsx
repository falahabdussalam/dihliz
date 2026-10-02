import Pagination from "@/components/dashboard/Pagination";
import Select from "@/components/dashboard/Select";
import AttendanceChooser from "./AttendanceChooser";
import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { studentQuery } from "@/lib/student-queries";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Modal from "@/components/dashboard/Dialog";
import ActionForm from "@/components/dashboard/ActionForm";
import {
  Panel,
  Field,
  Empty,
  Badge,
  inputClass,
  linkClass,
} from "@/components/dashboard/SchoolUI";
import { operationScope } from "./access";
import { categories, type Category } from "./rules";
import { openRegister, saveCriterion } from "./actions";
export default async function Directory({
  kind,
  filters,
}: {
  kind: "attendance" | "performance";
  filters: Record<string, string | undefined>;
}) {
  const user = await requirePageUser("/dashboard/" + kind);
  const { years, year } = await studentQuery(user, filters);
  const category = (
    Object.keys(categories).includes(filters.category ?? "")
      ? filters.category
      : user.role === "HOSTEL_MENTOR"
        ? "HOSTEL_BEHAVIOUR"
        : "CLASS_BEHAVIOUR"
  ) as Category;
  const scope = await operationScope(
    user,
    year?.id ?? "",
    kind === "performance" ? category : undefined,
  );
  const cohortIds = scope.cohorts
    .filter((c) => !filters.cohort || c.id === filters.cohort)
    .map((c) => c.id);
  const where = { cohortId: { in: cohortIds } };
  const total =
    kind === "attendance"
      ? await prisma.attendanceRegister.count({ where })
      : await prisma.performanceRegister.count({
          where: { ...where, category },
        });
  const page = Math.min(Math.max(1, Math.ceil(total / 25)), Math.max(1, parseInt(filters.page ?? "1") || 1));
  const rows =
    kind === "attendance"
      ? await prisma.attendanceRegister.findMany({
          where,
          include: { cohort: true, _count: { select: { entries: true } } },
          orderBy: { date: "desc" },
          take: 25,
          skip: (page - 1) * 25,
        })
      : await prisma.performanceRegister.findMany({
          where: { ...where, category },
          include: { cohort: true, _count: { select: { entries: true } } },
          orderBy: { month: "desc" },
          take: 25,
          skip: (page - 1) * 25,
        });
  const criteria =
    kind === "performance" && scope.admin
      ? await prisma.performanceCriterion.findMany({
          where: { category, isArchived: false },
          orderBy: { name: "asc" },
        })
      : [];
  const url = (p: number) =>
    "?" +
    new URLSearchParams({
      ...Object.fromEntries(
        Object.entries(filters).filter((e): e is [string, string] => !!e[1]),
      ),
      page: String(p),
    });
  return (
    <DashboardLayout
      currentUser={user}
      title={kind === "attendance" ? "Attendance" : "Monthly performance"}
      eyebrow={year?.name}
    >
      <div className="space-y-5">
        <div className="flex justify-end">
          {scope.cohorts.length > 0 && (
            <Modal title="Open register" primary>
              {kind === "attendance" && year ? (
                <AttendanceChooser
                  classes={scope.cohorts}
                  year={year.id}
                  start={year.startDate.toISOString().slice(0, 10)}
                  end={year.endDate.toISOString().slice(0, 10)}
                />
              ) : (
                <ActionForm action={openRegister} label="Open register">
                  <input type="hidden" name="kind" value={kind} />
                  <input type="hidden" name="category" value={category} />
                  <Field label="Class">
                    <Select className={inputClass} name="cohortId" required>
                      {scope.cohorts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.displayName}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field
                    label={kind === "attendance" ? "Date" : "Month (first day)"}
                  >
                    <input
                      className={inputClass}
                      name="date"
                      type="date"
                      required
                      min={year?.startDate.toISOString().slice(0, 10)}
                      max={year?.endDate.toISOString().slice(0, 10)}
                    />
                  </Field>
                  <p className="text-sm text-slate-500">
                    The roster
                    {kind === "performance"
                      ? " and criterion versions"
                      : ""}{" "}
                    will be preserved when opened.
                  </p>
                </ActionForm>
              )}
            </Modal>
          )}
        </div>
        <Panel title="Registers">
          <form className="mb-5 flex flex-wrap items-end gap-3">
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
                defaultValue={filters.cohort}
              >
                <option value="">All assigned classes</option>
                {scope.cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName}
                  </option>
                ))}
              </Select>
            </Field>
            {kind === "performance" && (
              <Field label="Category">
                <Select
                  name="category"
                  defaultValue={category}
                  className={inputClass}
                >
                  {Object.entries(categories)
                    .filter(
                      ([key]) =>
                        scope.admin ||
                        user.role ===
                          (key === "HOSTEL_BEHAVIOUR"
                            ? "HOSTEL_MENTOR"
                            : "CLASS_MENTOR"),
                    )
                    .map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                </Select>
              </Field>
            )}
            <button className={linkClass}>Apply filters</button>
          </form>
          <p className="mb-4 text-sm text-slate-500">
            {kind === "attendance"
              ? "Dates without a register have not been marked; they are never counted as absent."
              : "Academic, attendance and behaviour results are reported separately."}
          </p>
          <div className="divide-y">
            {rows.map((r) => (
              <Link
                href={"/dashboard/" + kind + "/" + r.id}
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm hover:text-emerald-700"
              >
                <span className="font-semibold">{r.cohort.displayName}</span>
                <span>
                  {("date" in r ? r.date : r.month)
                    .toISOString()
                    .slice(0, kind === "attendance" ? 10 : 7)}
                </span>
                <span>{r._count.entries} students</span>
                <Badge>{r.status}</Badge>
              </Link>
            ))}
          </div>
          {!rows.length && (
            <Empty>No registers in this view. Open a register to begin.</Empty>
          )}
          <Pagination currentPage={page} totalPages={Math.ceil(total / 25)} total={total} />
        </Panel>
        {kind === "performance" && scope.admin && (
          <Panel title="Category criteria">
            {[...criteria, null].map((c) => (
              <div
                key={c?.id ?? "new"}
                className="flex items-center justify-between border-b py-3"
              >
                <span className="text-sm">
                  {c
                    ? c.name + " · maximum " + c.maximum + " · v" + c.version
                    : "New criterion"}
                </span>
                <Modal title={c ? "Edit criterion" : "Add criterion"}>
                  <ActionForm action={saveCriterion}>
                    <input type="hidden" name="category" value={category} />
                    <input
                      type="hidden"
                      name="version"
                      value={c?.version ?? 0}
                    />
                    <Field label="Code">
                      <input
                        name="code"
                        className={inputClass}
                        defaultValue={c?.code}
                        readOnly={!!c}
                        required
                      />
                    </Field>
                    <Field label="Name">
                      <input
                        name="name"
                        className={inputClass}
                        defaultValue={c?.name}
                        required
                      />
                    </Field>
                    <Field label="Maximum (1–10)">
                      <input
                        name="maximum"
                        type="number"
                        min={1}
                        max={10}
                        step="0.01"
                        className={inputClass}
                        defaultValue={c?.maximum ?? 10}
                        required
                      />
                    </Field>
                    {c && (
                      <label>
                        <input type="checkbox" name="archived" /> Retire from
                        future registers
                      </label>
                    )}
                    <p className="text-xs text-slate-500">
                      Saving creates a version. Historical evaluations are
                      unchanged.
                    </p>
                  </ActionForm>
                </Modal>
              </div>
            ))}
          </Panel>
        )}
      </div>
    </DashboardLayout>
  );
}
