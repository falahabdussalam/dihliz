import ClassSelection from "@/features/examinations/ClassSelection";
import Modal from "@/components/dashboard/Dialog";
import { createExamination } from "@/features/examinations/actions";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import { schoolScope } from "@/lib/school-access";
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
export const metadata = { title: "Examinations - Dihliz" };
export default async function Exams({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    cohort?: string;
    status?: string;
    q?: string;
    page?: string;
    archived?: string;
  }>;
}) {
  const user = await requirePageUser("/dashboard/exams"),
    filters = await searchParams;
  const years = await prisma.academicYear.findMany({
    where: { isArchived: false },
    orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
  });
  const year = filters.year
    ? years.find((y) => y.id === filters.year)
    : years[0];
  const scope = await schoolScope(user, year?.id ?? "");
  const cohort = scope.cohorts.find((c) => c.id === filters.cohort);
  const status = ["DRAFT", "FINAL", "LOCKED"].includes(filters.status ?? "")
    ? (filters.status as "DRAFT" | "FINAL" | "LOCKED")
    : undefined;
  const where = {
    isArchived: scope.admin && filters.archived === "1",
    cohortId: {
      in: scope.cohorts
        .filter((c) => !filters.cohort || c.id === filters.cohort)
        .map((c) => c.id),
    },
    ...(status ? { status } : {}),
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
  const previousNames = scope.admin
    ? await prisma.examination.findMany({
        select: { title: true },
        distinct: ["title"],
        orderBy: { title: "asc" },
        take: 100,
      })
    : [];
  const total = await prisma.exam.count({ where });
  const page = Math.min(
    Math.max(1, Math.ceil(total / 20)),
    Math.max(1, Number.parseInt(filters.page ?? "1") || 1),
  );
  const [exams, subjects] = await Promise.all([
    prisma.exam.findMany({
      where,
      include: {
        event: {
          include: {
            exams: { select: { id: true, cohortId: true, status: true } },
          },
        },
        cohort: true,
        _count: { select: { subjects: true, candidates: true } },
      },
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take: 20,
      skip: (page - 1) * 20,
    }),
    cohort && scope.admin
      ? prisma.cohortSubject.findMany({
          where: {
            cohortId: cohort.id,
            isArchived: false,
            subject: { isArchived: false },
          },
          include: { subject: true },
          orderBy: { subject: { name: "asc" } },
        })
      : [],
  ]);
  const pageHref = (n: number) =>
    "/dashboard/exams?" +
    new URLSearchParams({
      year: year?.id ?? "",
      cohort: filters.cohort ?? "",
      status: filters.status ?? "",
      q: filters.q ?? "",
      archived: filters.archived ?? "",
      page: String(n),
    });
  return (
    <DashboardLayout
      currentUser={user}
      title="Examinations"
      eyebrow={year?.name ?? "Academic year"}
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          {scope.admin && year && (
            <Modal title="Create examination" primary>
              <ActionForm action={createExamination} label="Create examination">
                <input type="hidden" name="yearId" value={year.id} />
                <Field label="Name">
                  <input
                    name="title"
                    list="yearly-exam-names"
                    className={inputClass}
                    required
                    minLength={2}
                    maxLength={120}
                  />
                </Field>
                <datalist id="yearly-exam-names">
                  {previousNames.map((e) => (
                    <option key={e.title} value={e.title} />
                  ))}
                </datalist>
                <p className="text-xs text-slate-500">
                  Reuse an existing exam name for its yearly edition, or enter a
                  new name.
                </p>
                <Field label="Exam date">
                  <input
                    name="date"
                    type="date"
                    className={inputClass}
                    required
                    min={year.startDate.toISOString().slice(0, 10)}
                    max={year.endDate.toISOString().slice(0, 10)}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Mark entry due date">
                    <input
                      name="markEntryDueDate"
                      type="date"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Publish date">
                    <input
                      name="publishDate"
                      type="date"
                      className={inputClass}
                      required
                    />
                  </Field>
                </div>
                <p className="text-sm text-slate-500">
                  Schedule for {year.name}. Create a separate examination in
                  each academic year to preserve yearly results. Publication
                  remains an administrator action.
                </p>
                <ClassSelection classes={scope.cohorts} />
                <p className="text-sm text-slate-500">
                  Each class retains its own subjects, roster and results.
                  Configure its subjects before entering marks.
                </p>
              </ActionForm>
            </Modal>
          )}
        </div>
        <Stats
          items={[
            { label: "Exams in this view", value: total },
            { label: "Accessible classes", value: scope.cohorts.length },
            { label: "Selected class", value: cohort?.displayName ?? "All" },
          ]}
        />
        <Panel title="Exams and marks">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Open an exam to enter marks and view results.
            </p>
            {scope.admin && (
              <Link
                className={linkClass}
                href={"/dashboard/academic/subjects?year=" + (year?.id ?? "")}
              >
                Manage subjects
              </Link>
            )}
          </div>
          <form className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Field label="Academic year">
              <select
                className={inputClass}
                name="year"
                defaultValue={year?.id}
              >
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
                defaultValue={filters.cohort ?? ""}
              >
                <option value="">All accessible classes</option>
                {scope.cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                className={inputClass}
                name="status"
                defaultValue={filters.status ?? ""}
              >
                <option value="">All statuses</option>
                {["DRAFT", "FINAL", "LOCKED"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Exam name">
              <input
                className={inputClass}
                name="q"
                defaultValue={filters.q}
                placeholder="Search exams…"
              />
            </Field>
            <div className="flex items-end">
              <button className={linkClass}>Apply filters</button>
            </div>
            {scope.admin && (
              <label className="text-sm">
                <input
                  type="checkbox"
                  name="archived"
                  value="1"
                  defaultChecked={filters.archived === "1"}
                />{" "}
                Archived exams
              </label>
            )}
          </form>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {[
                    "Exam",
                    "Class",
                    "Date",
                    "Subjects",
                    "Students",
                    "Status",
                  ].map((h) => (
                    <th key={h} className="p-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <Link
                        className="font-semibold text-[#0b7a4b] hover:underline"
                        href={"/dashboard/exams/" + exam.id}
                      >
                        {exam.title}
                      </Link>
                      {exam.event && (
                        <p className="mt-1 text-xs text-slate-500">
                          {
                            exam.event.exams.filter((e) =>
                              scope.cohorts.some((c) => c.id === e.cohortId),
                            ).length
                          }{" "}
                          participating classes
                          {exam.event.isDemo ? " · DEMO" : ""}
                        </p>
                      )}
                    </td>
                    <td className="p-3">{exam.cohort.displayName}</td>
                    <td className="p-3">
                      {exam.date.toISOString().slice(0, 10)}
                      <span className="block text-xs text-slate-500">
                        Entry due:{" "}
                        {exam.markEntryDueDate?.toISOString().slice(0, 10) ??
                          "Not set"}
                        <br />
                        Publish:{" "}
                        {exam.publishDate?.toISOString().slice(0, 10) ??
                          "Not set"}
                      </span>
                    </td>
                    <td className="p-3">{exam._count.subjects}</td>
                    <td className="p-3">{exam._count.candidates}</td>
                    <td className="p-3">
                      <Badge>{exam.status}</Badge>
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
          <div className="mt-4 flex items-center justify-between">
            <Link className={linkClass} href={pageHref(Math.max(1, page - 1))}>
              Previous
            </Link>
            <span className="text-xs text-slate-500">
              Page {page} · {total} exams
            </span>
            <Link className={linkClass} href={pageHref(page + 1)}>
              Next
            </Link>
          </div>
        </Panel>
      </div>
    </DashboardLayout>
  );
}
