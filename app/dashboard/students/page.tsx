import Select from "@/components/dashboard/Select";
import Pagination from "@/components/dashboard/Pagination";
import Modal from "@/components/dashboard/Dialog";
import BulkSelection from "@/components/dashboard/BulkSelection";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import { createPageMetadata } from "@/lib/metadata";
import {
  studentQuery,
  studentListInclude,
  type StudentFilters,
} from "@/lib/student-queries";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ActionForm from "@/components/dashboard/ActionForm";
import {
  Panel,
  Field,
  Stats,
  Badge,
  Empty,
  inputClass,
  linkClass,
} from "@/components/dashboard/SchoolUI";
import { saveStudent, promoteStudents } from "./actions";
export const metadata = createPageMetadata("Students - Dihliz");
export default async function Students({
  searchParams,
}: {
  searchParams: Promise<StudentFilters>;
}) {
  const user = await requirePageUser("/dashboard/students");
  const filters = await searchParams;
  const { years, year, scope, houses, where } = await studentQuery(
    user,
    filters,
  );
  const total = await prisma.studentEnrollment.count({ where });
  const pages = Math.max(1, Math.ceil(total / 25));
  const page = Math.min(
    pages,
    Math.max(1, Number.parseInt(filters.page ?? "1", 10) || 1),
  );
  const [rows, noContacts, unassigned, streams, targetCohorts] =
    await Promise.all([
      prisma.studentEnrollment.findMany({
        where,
        include: studentListInclude,
        orderBy: [{ student: { fullName: "asc" } }, { id: "asc" }],
        take: 25,
        skip: (page - 1) * 25,
      }),
      prisma.studentEnrollment.count({
        where: { AND: [where, { student: { contacts: { none: {} } } }] },
      }),
      prisma.studentEnrollment.count({
        where: { AND: [where, { houseId: null }] },
      }),
      prisma.stream.findMany({
        where: { isArchived: false },
        orderBy: { name: "asc" },
      }),
      scope.admin && year
        ? prisma.academicCohort.findMany({
            where: {
              isArchived: false,
              academicYear: {
                startDate: { gt: year.startDate },
                isArchived: false,
              },
            },
            include: { academicYear: true },
            orderBy: { displayName: "asc" },
          })
        : [],
    ]);
  const query = new URLSearchParams(
    Object.entries(filters).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
  const pageUrl = (next: number) => {
    const q = new URLSearchParams(query);
    q.set("page", String(next));
    return "/dashboard/students?" + q;
  };
  const table = (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {scope.admin && <th className="p-3">Select</th>}
            <th className="p-3">Student</th>
            <th className="p-3">Class / stream</th>
            <th className="p-3">House</th>
            <th className="p-3">Parent / contact</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="group/row transition-all duration-200 hover:bg-emerald-50/25 hover:shadow-[inset_3px_0_0_0_#0b7a4b]"
            >
              {scope.admin && (
                <td className="p-3">
                  <input
                    type="checkbox"
                    name="enrollmentIds"
                    value={row.id}
                    disabled={row.status !== "ACTIVE" || row.student.isArchived}
                    aria-label={"Select " + row.student.fullName}
                  />
                </td>
              )}
              <td className="p-3">
                <Link
                  className="font-semibold text-[#0b7a4b] transition-colors duration-150 hover:text-emerald-800 hover:underline"
                  href={
                    "/dashboard/students/" +
                    row.studentId +
                    "?year=" +
                    row.academicYearId
                  }
                >
                  {row.student.fullName}
                </Link>
                <p className="mt-1 text-xs text-slate-400">
                  {row.student.studentNumber}
                  {row.rollNumber ? " · Roll " + row.rollNumber : ""}
                </p>
              </td>
              <td className="p-3">
                {row.cohort.displayName}
                <p className="text-xs text-slate-400">
                  {row.studyStream?.name}
                </p>
              </td>
              <td className="p-3">
                {row.house?.name ?? (
                  <span className="text-amber-700">Unassigned</span>
                )}
              </td>
              <td className="p-3">
                {row.student.guardians[0]?.fullName ?? "Parent not added"}
                <p className="mt-1 text-xs text-slate-500">
                  {row.student.contacts[0]?.rawValue ?? "No contact number"}
                </p>
                {row.student.contacts.some(
                  (c) => c.verificationStatus === "NEEDS_REVIEW",
                ) && (
                  <span className="text-xs text-amber-700">
                    Contact needs review
                  </span>
                )}
              </td>
              <td className="p-3">
                <Badge>
                  {row.student.isArchived ? "ARCHIVED" : row.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <Empty>No students match these filters.</Empty>}
    </div>
  );
  return (
    <DashboardLayout
      currentUser={user}
      title="Students"
      eyebrow={year?.name ?? "Select an academic year"}
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          {" "}
          {scope.admin && (
            <Modal title="Add student" primary>
              <ActionForm action={saveStudent} label="Create student">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <Field label="Full name">
                    <input
                      name="fullName"
                      required
                      minLength={2}
                      maxLength={160}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Date of birth">
                    <input
                      name="dateOfBirth"
                      type="date"
                      max={new Date().toISOString().slice(0, 10)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Class">
                    <Select name="cohortId" className={inputClass} required>
                      <option value="">Select class</option>
                      {scope.cohorts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.displayName}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Study stream (optional)">
                    <Select name="studyStreamId" className={inputClass}>
                      <option value="">Use cohort stream</option>
                      {streams.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="House">
                    <Select name="houseId" className={inputClass}>
                      <option value="">Unassigned</option>
                      {houses.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Parent / guardian">
                    <input
                      name="parentName"
                      maxLength={160}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Contact number">
                    <input
                      name="mobile"
                      maxLength={255}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </ActionForm>
            </Modal>
          )}
        </div>
        <Stats
          items={[
            { label: "Students in this view", value: total },
            { label: "Missing contact details", value: noContacts },
            { label: "House unassigned", value: unassigned },
          ]}
        />
        <Panel title="Student directory">
          <form className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
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
            <Field label="House">
              <Select
                className={inputClass}
                name="house"
                defaultValue={filters.house ?? ""}
              >
                <option value="">All houses</option>
                <option value="unassigned">Unassigned</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
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
                {["ACTIVE", "INACTIVE", "WITHDRAWN", "COMPLETED"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Search name, ID or phone">
              <input
                className={inputClass}
                name="q"
                defaultValue={filters.q}
                maxLength={120}
                placeholder="Search students…"
              />
            </Field>
            <div className="flex items-end gap-2">
              <button className={linkClass}>Apply filters</button>
              <Link
                href="/dashboard/students"
                className="text-xs text-slate-500"
              >
                Reset
              </Link>
            </div>
            {scope.admin && (
              <label className="text-xs text-slate-600">
                <input
                  type="checkbox"
                  name="archived"
                  value="1"
                  defaultChecked={filters.archived === "1"}
                />{" "}
                Show archived students
              </label>
            )}
          </form>
          <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              {total ? (page - 1) * 25 + 1 : 0}–{Math.min(page * 25, total)} of{" "}
              {total}
            </span>
            <a className={linkClass} href={"/api/students/export?" + query}>
              Export filtered CSV
            </a>
          </div>
          {scope.admin ? (
            <BulkSelection
              action={promoteStudents}
              fields={
                <div className="grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
                  <Field label="Promotion target (later academic year)">
                    <Select
                      name="targetCohortId"
                      className={inputClass}
                      required
                    >
                      <option value="">Select target class</option>
                      {targetCohorts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.academicYear.name} · {c.displayName}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <label className="self-center text-sm text-slate-600">
                    <input type="checkbox" name="keepHouse" /> Carry house
                    assignments into the new year
                  </label>
                  <p className="text-xs text-slate-500 sm:col-span-2">
                    Select active students from one cohort. Configure the next
                    academic year and cohorts in Academic setup first.
                  </p>
                </div>
              }
            >
              {table}
            </BulkSelection>
          ) : (
            table
          )}
          <Pagination currentPage={page} totalPages={pages} />
        </Panel>
      </div>
    </DashboardLayout>
  );
}
