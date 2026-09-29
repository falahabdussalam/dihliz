import Modal from "@/components/dashboard/Dialog";
import AcademicTabs from "@/features/academics/Tabs";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import { schoolScope } from "@/lib/school-access";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ActionForm from "@/components/dashboard/ActionForm";
import {
  Panel,
  Field,
  inputClass,
  linkClass,
} from "@/components/dashboard/SchoolUI";
import { saveSubject, saveCohortSubject } from "@/app/dashboard/exams/actions";
export const metadata = { title: "Subjects - Dihliz" };
export default async function Subjects({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; cohort?: string }>;
}) {
  const user = await requirePageUser("/dashboard/academic/subjects");
  if (user.role !== "SUPER_ADMIN")
    return (
      <DashboardLayout currentUser={user} title="Subjects">
        <p>Only a Super Admin can manage subjects.</p>
      </DashboardLayout>
    );
  const filters = await searchParams;
  const [years, subjects, departments, tutors] = await Promise.all([
    prisma.academicYear.findMany({
      where: { isArchived: false },
      orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
    }),
    prisma.subject.findMany({
      include: { department: true },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({
      where: { isArchived: false },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { isActive: true, role: "SUBJECT_TUTOR" },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
  ]);
  const year = filters.year
    ? years.find((y) => y.id === filters.year)
    : years[0];
  const scope = await schoolScope(user, year?.id ?? "");
  const cohort = filters.cohort
    ? scope.cohorts.find((c) => c.id === filters.cohort)
    : scope.cohorts[0];
  const assigned = cohort
    ? await prisma.cohortSubject.findMany({
        where: { cohortId: cohort.id },
        include: { subject: true },
        orderBy: { subject: { name: "asc" } },
      })
    : [];
  return (
    <DashboardLayout
      currentUser={user}
      title="Subject setup"
      eyebrow={year?.name}
    >
      <div className="space-y-6">
        <AcademicTabs active="subjects" year={year?.id} />
        <Link
          className={linkClass}
          href={
            "/dashboard/academic?year=" +
            (year?.id ?? "") +
            "&cohort=" +
            (cohort?.id ?? "")
          }
        >
          ← Academic setup
        </Link>
        <Panel title="Yearly class subjects">
          <form className="mb-5 flex flex-wrap items-end gap-3">
            <Field label="Academic year">
              <select
                name="year"
                defaultValue={year?.id}
                className={inputClass}
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
                name="cohort"
                defaultValue={cohort?.id}
                className={inputClass}
              >
                {scope.cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName}
                  </option>
                ))}
              </select>
            </Field>
            <button className={linkClass}>Load class</button>
          </form>
          <div className="space-y-3">
            {assigned.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4"
              >
                <p className="text-sm">
                  {s.subject.name} · {s.maxMarks} marks{" "}
                  {s.isArchived ? "· Archived" : ""}
                </p>
                <Modal title="Edit subject">
                  <ActionForm action={saveCohortSubject} className="mt-4">
                    <input type="hidden" name="cohortId" value={s.cohortId} />
                    <input type="hidden" name="subjectId" value={s.subjectId} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Maximum marks">
                        <input
                          className={inputClass}
                          name="maxMarks"
                          type="number"
                          min="0.01"
                          max="10000"
                          step="0.01"
                          defaultValue={s.maxMarks}
                          required
                        />
                      </Field>
                      <Field label="Pass marks">
                        <input
                          className={inputClass}
                          name="passMarks"
                          type="number"
                          min="0"
                          max="10000"
                          step="0.01"
                          defaultValue={s.passMarks}
                          required
                        />
                      </Field>
                      <Field label="Assigned tutor">
                        <select
                          name="tutorId"
                          className={inputClass}
                          defaultValue={s.tutorId ?? ""}
                        >
                          <option value="">Unassigned</option>
                          {tutors.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.fullName}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Applies to">
                        <select
                          name="studyStreamCode"
                          className={inputClass}
                          defaultValue={s.studyStreamCode ?? ""}
                        >
                          <option value="">All students in class</option>
                          {cohort?.stream?.code === "SCIENCE" && (
                            <>
                              <option value="COMPUTER_SCIENCE">
                                Computer Science students
                              </option>
                              <option value="BIOLOGY_SCIENCE">
                                Biology Science students
                              </option>
                            </>
                          )}
                        </select>
                      </Field>
                    </div>
                    <label className="text-sm">
                      <input
                        type="checkbox"
                        name="isArchived"
                        defaultChecked={s.isArchived}
                      />{" "}
                      Archive assignment for future exams
                    </label>
                  </ActionForm>
                </Modal>
              </div>
            ))}
          </div>
          {cohort && (
            <Modal title={"Assign subject to " + cohort.displayName}>
              <ActionForm
                action={saveCohortSubject}
                label="Assign subject"
                className="mt-4"
              >
                <input type="hidden" name="cohortId" value={cohort.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Subject">
                    <select name="subjectId" className={inputClass} required>
                      <option value="">Select subject</option>
                      {subjects
                        .filter(
                          (s) =>
                            !s.isArchived &&
                            !assigned.some((a) => a.subjectId === s.id),
                        )
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </Field>
                  <Field label="Assigned tutor">
                    <select name="tutorId" className={inputClass}>
                      <option value="">Unassigned</option>
                      {tutors.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Maximum marks">
                    <input
                      className={inputClass}
                      name="maxMarks"
                      type="number"
                      min="0.01"
                      max="10000"
                      step="0.01"
                      defaultValue="100"
                      required
                    />
                  </Field>
                  <Field label="Pass marks">
                    <input
                      className={inputClass}
                      name="passMarks"
                      type="number"
                      min="0"
                      max="10000"
                      step="0.01"
                      defaultValue="40"
                      required
                    />
                  </Field>
                  <Field label="Applies to">
                    <select name="studyStreamCode" className={inputClass}>
                      <option value="">All students in class</option>
                      {cohort.stream?.code === "SCIENCE" && (
                        <>
                          <option value="COMPUTER_SCIENCE">
                            Computer Science students
                          </option>
                          <option value="BIOLOGY_SCIENCE">
                            Biology Science students
                          </option>
                        </>
                      )}
                    </select>
                  </Field>
                </div>
              </ActionForm>
            </Modal>
          )}
        </Panel>
        <Panel title="Subject master">
          <div className="space-y-3">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4"
              >
                <p className="text-sm">
                  {s.name} · {s.code} · {s.department.name}
                  {s.isArchived ? " · Archived" : ""}
                </p>
                <Modal title="Edit subject">
                  <ActionForm action={saveSubject} className="mt-4">
                    <input type="hidden" name="subjectId" value={s.id} />
                    <Field label="Code">
                      <input
                        className={inputClass}
                        name="code"
                        defaultValue={s.code}
                        required
                        maxLength={40}
                      />
                    </Field>
                    <Field label="Subject name">
                      <input
                        className={inputClass}
                        name="name"
                        defaultValue={s.name}
                        required
                        minLength={2}
                        maxLength={100}
                      />
                    </Field>
                    <Field label="Department">
                      <select
                        className={inputClass}
                        name="departmentId"
                        defaultValue={s.departmentId}
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <label className="text-sm">
                      <input
                        type="checkbox"
                        name="isArchived"
                        defaultChecked={s.isArchived}
                      />{" "}
                      Archive subject
                    </label>
                  </ActionForm>
                </Modal>
              </div>
            ))}
          </div>
          <Modal title="Add subject">
            <ActionForm
              action={saveSubject}
              label="Create subject"
              className="mt-4"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Code">
                  <input
                    className={inputClass}
                    name="code"
                    placeholder="MATH"
                    required
                    maxLength={40}
                  />
                </Field>
                <Field label="Subject name">
                  <input
                    className={inputClass}
                    name="name"
                    placeholder="Mathematics"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </Field>
                <Field label="Department">
                  <select className={inputClass} name="departmentId" required>
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </ActionForm>
          </Modal>
        </Panel>
      </div>
    </DashboardLayout>
  );
}
