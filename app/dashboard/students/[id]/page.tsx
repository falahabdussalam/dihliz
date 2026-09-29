import Modal from "@/components/dashboard/Dialog";
import Tabs from "@/components/dashboard/Tabs";
import StudentRecords from "@/features/students/Records";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import { studentQuery } from "@/lib/student-queries";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ActionForm from "@/components/dashboard/ActionForm";
import {
  Panel,
  Field,
  Badge,
  inputClass,
  linkClass,
} from "@/components/dashboard/SchoolUI";
import {
  saveStudent,
  saveEnrollment,
  saveGuardian,
  saveContact,
  archiveStudent,
} from "../actions";
export const metadata = { title: "Student profile - Dihliz" };
export default async function StudentProfile({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; tab?: string }>;
}) {
  const user = await requirePageUser("/dashboard/students");
  const { id } = await params,
    filters = await searchParams;
  const tab = [
    "overview",
    "profile",
    "academics",
    "attendance",
    "examinations",
    "performance",
    "achievements",
    "reports",
  ].includes(filters.tab ?? "")
    ? filters.tab!
    : "overview";
  const { years, year, scope, houses } = await studentQuery(user, filters);
  const student = await prisma.student.findFirst({
    where: {
      id,
      ...(scope.admin
        ? {}
        : {
            isArchived: false,
            enrollments: {
              some: {
                academicYearId: year?.id ?? "",
                cohortId: { in: scope.cohorts.map((c) => c.id) },
              },
            },
          }),
    },
    include: {
      guardians: {
        where: tab === "profile" ? {} : { id: "" },
        orderBy: { createdAt: "asc" },
      },
      contacts: {
        where: tab === "profile" ? {} : { id: "" },
        orderBy: { sortOrder: "asc" },
      },
      enrollments: {
        where: scope.admin
          ? {}
          : {
              academicYearId: year?.id ?? "",
              cohortId: { in: scope.cohorts.map((c) => c.id) },
            },
        include: {
          cohort: { include: { academicYear: true } },
          house: true,
          studyStream: true,
        },
        orderBy: { cohort: { academicYear: { startDate: "desc" } } },
      },
    },
  });
  if (!student) notFound();
  const streams =
    tab === "academics"
      ? await prisma.stream.findMany({ where: { isArchived: false } })
      : [];
  const selected = student.enrollments.find(
    (e) => e.academicYearId === year?.id,
  );
  return (
    <DashboardLayout
      currentUser={user}
      title={student.fullName}
      eyebrow={student.studentNumber}
    >
      <div className="space-y-6">
        <Link
          className={linkClass}
          href={"/dashboard/students?year=" + (year?.id ?? "")}
        >
          ← Student directory
        </Link>
        <Panel title={student.fullName}>
          <div className="flex flex-wrap items-center gap-4">
            {student.photoUrl && (
              <img
                src={student.photoUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-xl object-cover"
              />
            )}
            <div className="text-sm">
              <p className="font-semibold">{student.studentNumber}</p>
              <p>
                {selected?.cohort.displayName ?? "No enrollment"} ·{" "}
                {selected?.studyStream?.name ?? "No stream"} ·{" "}
                {selected?.house?.name ?? "House unassigned"}
              </p>
              <Badge>
                {student.isArchived
                  ? "ARCHIVED"
                  : (selected?.status ?? "Not enrolled")}
              </Badge>
            </div>
            <form className="ml-auto flex gap-2">
              <input type="hidden" name="tab" value={tab} />
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
              <button className={linkClass}>Select year</button>
            </form>
          </div>
        </Panel>
        <Tabs
          active={tab}
          items={[
            "Overview",
            "Profile",
            "Academics",
            "Attendance",
            "Examinations",
            "Performance",
            "Achievements",
            "Reports",
          ].map((label) => ({
            id: label.toLowerCase(),
            label,
            href: "?year=" + (year?.id ?? "") + "&tab=" + label.toLowerCase(),
          }))}
        />
        {tab === "profile" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <Panel title="Permanent profile">
              {student.photoUrl && (
                <img
                  src={student.photoUrl}
                  alt={student.fullName}
                  referrerPolicy="no-referrer"
                  className="mb-4 h-24 w-24 rounded-xl border border-slate-200 object-cover"
                />
              )}
              <p className="mb-4 text-sm">
                {student.fullName} · Born{" "}
                {student.dateOfBirth?.toISOString().slice(0, 10) ??
                  "Not provided"}
              </p>
              {scope.admin ? (
                <Modal title="Edit profile">
                  <ActionForm action={saveStudent}>
                    <input type="hidden" name="studentId" value={student.id} />
                    <input
                      type="hidden"
                      name="updatedAt"
                      value={student.updatedAt.toISOString()}
                    />
                    <Field label="Full name">
                      <input
                        className={inputClass}
                        name="fullName"
                        defaultValue={student.fullName}
                        required
                        minLength={2}
                        maxLength={160}
                      />
                    </Field>
                    <Field label="Date of birth">
                      <input
                        className={inputClass}
                        type="date"
                        name="dateOfBirth"
                        max={new Date().toISOString().slice(0, 10)}
                        defaultValue={student.dateOfBirth
                          ?.toISOString()
                          .slice(0, 10)}
                      />
                    </Field>
                    <Field label="Photo URL (HTTPS)">
                      <input
                        className={inputClass}
                        type="url"
                        name="photoUrl"
                        defaultValue={student.photoUrl ?? ""}
                        maxLength={500}
                      />
                    </Field>
                    <p className="text-xs text-slate-500">
                      Permanent ID: {student.studentNumber}
                    </p>
                  </ActionForm>
                </Modal>
              ) : (
                <dl className="space-y-3 text-sm">
                  <dt>Name</dt>
                  <dd>{student.fullName}</dd>
                  <dt>Date of birth</dt>
                  <dd>
                    {student.dateOfBirth?.toISOString().slice(0, 10) ??
                      "Not provided"}
                  </dd>
                </dl>
              )}
            </Panel>
          </div>
        )}
        {tab === "profile" && (
          <>
            <Panel title="Guardians">
              <div className="grid gap-5 lg:grid-cols-2">
                {[...student.guardians, ...(scope.admin ? [null] : [])].map(
                  (guardian, index) =>
                    scope.admin ? (
                      <div key={guardian?.id ?? "new"}>
                        <p className="mb-2 text-sm">
                          {guardian?.fullName} {guardian?.relationship}
                        </p>
                        <Modal
                          title={guardian ? "Edit guardian" : "Add guardian"}
                        >
                          <ActionForm
                            action={saveGuardian}
                            label={guardian ? "Save guardian" : "Add guardian"}
                            className="rounded-lg border border-slate-100 p-4"
                          >
                            <input
                              type="hidden"
                              name="studentId"
                              value={student.id}
                            />
                            <input
                              type="hidden"
                              name="guardianId"
                              value={guardian?.id ?? ""}
                            />
                            <input
                              type="hidden"
                              name="updatedAt"
                              value={guardian?.updatedAt.toISOString() ?? ""}
                            />
                            <Field
                              label={
                                guardian ? "Guardian name" : "New guardian name"
                              }
                            >
                              <input
                                name="fullName"
                                className={inputClass}
                                defaultValue={guardian?.fullName ?? ""}
                                required
                                minLength={2}
                                maxLength={160}
                              />
                            </Field>
                            <Field label="Relationship">
                              <select
                                name="relationship"
                                className={inputClass}
                                defaultValue={guardian?.relationship ?? ""}
                              >
                                <option value="">Unspecified</option>
                                {["FATHER", "MOTHER", "GUARDIAN", "OTHER"].map(
                                  (s) => (
                                    <option key={s}>{s}</option>
                                  ),
                                )}
                              </select>
                            </Field>
                          </ActionForm>
                        </Modal>
                      </div>
                    ) : (
                      <p key={index} className="text-sm">
                        {guardian?.fullName} ·{" "}
                        {guardian?.relationship ?? "Unspecified"}
                      </p>
                    ),
                )}
              </div>
            </Panel>
            <Panel title="Contact details">
              <div className="grid gap-5 lg:grid-cols-2">
                {[...student.contacts, ...(scope.admin ? [null] : [])].map(
                  (contact, index) =>
                    scope.admin ? (
                      <div key={contact?.id ?? "new"}>
                        <p className="mb-2 text-sm">
                          {contact?.rawValue} {contact?.label}
                        </p>
                        <Modal title={contact ? "Edit contact" : "Add contact"}>
                          <ActionForm
                            action={saveContact}
                            label={contact ? "Save contact" : "Add contact"}
                            className="rounded-lg border border-slate-100 p-4"
                          >
                            <input
                              type="hidden"
                              name="studentId"
                              value={student.id}
                            />
                            <input
                              type="hidden"
                              name="contactId"
                              value={contact?.id ?? ""}
                            />
                            <input
                              type="hidden"
                              name="updatedAt"
                              value={contact?.updatedAt.toISOString() ?? ""}
                            />
                            <Field
                              label={
                                contact ? "Original contact" : "New contact"
                              }
                            >
                              <input
                                name="rawValue"
                                className={inputClass}
                                defaultValue={contact?.rawValue ?? ""}
                                required
                                maxLength={255}
                              />
                            </Field>
                            <Field label="International number">
                              <input
                                name="normalizedPhone"
                                className={inputClass}
                                defaultValue={contact?.normalizedPhone ?? ""}
                                placeholder="+919876543210"
                              />
                            </Field>
                            <Field label="Label">
                              <input
                                name="label"
                                className={inputClass}
                                defaultValue={contact?.label ?? ""}
                                placeholder="Mother, father, emergency…"
                                maxLength={40}
                              />
                            </Field>
                            <Field label="Linked guardian">
                              <select
                                className={inputClass}
                                name="guardianId"
                                defaultValue={contact?.guardianId ?? ""}
                              >
                                <option value="">Not linked</option>
                                {student.guardians.map((g) => (
                                  <option key={g.id} value={g.id}>
                                    {g.fullName}
                                  </option>
                                ))}
                              </select>
                            </Field>
                            <Field label="Verification">
                              <select
                                className={inputClass}
                                name="verificationStatus"
                                defaultValue={
                                  contact?.verificationStatus ?? "UNVERIFIED"
                                }
                              >
                                {["UNVERIFIED", "NEEDS_REVIEW", "VERIFIED"].map(
                                  (s) => (
                                    <option key={s}>{s}</option>
                                  ),
                                )}
                              </select>
                            </Field>
                          </ActionForm>
                        </Modal>
                      </div>
                    ) : (
                      <div key={index}>
                        <p className="text-sm">{contact?.rawValue}</p>
                        <Badge>{contact?.verificationStatus}</Badge>
                      </div>
                    ),
                )}
              </div>
            </Panel>
          </>
        )}
        {tab === "academics" && (
          <>
            {" "}
            <Panel title={"Enrollment · " + (year?.name ?? "")}>
              <p className="mb-4 text-sm">
                {selected?.cohort.displayName} · {selected?.studyStream?.name} ·
                Roll {selected?.rollNumber ?? "unassigned"} ·{" "}
                {selected?.house?.name ?? "No house"}
              </p>
              {selected && scope.admin ? (
                <Modal title="Edit enrollment">
                  <ActionForm action={saveEnrollment}>
                    <input
                      type="hidden"
                      name="enrollmentId"
                      value={selected.id}
                    />
                    <input
                      type="hidden"
                      name="updatedAt"
                      value={selected.updatedAt.toISOString()}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Class">
                        <select
                          className={inputClass}
                          name="cohortId"
                          defaultValue={selected.cohortId}
                        >
                          {scope.cohorts.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.displayName}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Study stream">
                        <select
                          className={inputClass}
                          name="studyStreamId"
                          defaultValue={selected.studyStreamId ?? ""}
                        >
                          <option value="">Use cohort stream</option>
                          {streams.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="House">
                        <select
                          className={inputClass}
                          name="houseId"
                          defaultValue={selected.houseId ?? ""}
                        >
                          <option value="">Unassigned</option>
                          {houses.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Roll number">
                        <input
                          className={inputClass}
                          name="rollNumber"
                          defaultValue={selected.rollNumber ?? ""}
                          maxLength={40}
                        />
                      </Field>
                      <Field label="Status">
                        <select
                          className={inputClass}
                          name="status"
                          defaultValue={selected.status}
                        >
                          {["ACTIVE", "INACTIVE", "WITHDRAWN", "COMPLETED"].map(
                            (s) => (
                              <option key={s}>{s}</option>
                            ),
                          )}
                        </select>
                      </Field>
                    </div>
                  </ActionForm>
                </Modal>
              ) : (
                <p className="text-sm text-slate-600">
                  {selected
                    ? selected.cohort.displayName +
                      " · " +
                      selected.status +
                      " · " +
                      (selected.house?.name ?? "House unassigned")
                    : "No enrollment for the selected year."}
                </p>
              )}
            </Panel>
            <Panel title="Academic history">
              <div className="divide-y divide-slate-100">
                {student.enrollments.map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                  >
                    <Link
                      className="text-[#0b7a4b]"
                      href={"?year=" + e.academicYearId + "&tab=academics"}
                    >
                      {e.cohort.academicYear.name} · {e.cohort.displayName}
                    </Link>
                    <span>
                      {e.studyStream?.name} ·{" "}
                      {e.house?.name ?? "House unassigned"}
                    </span>
                    <Badge>{e.status}</Badge>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}
        {scope.admin && tab === "profile" && (
          <Modal
            title={student.isArchived ? "Restore student" : "Archive student"}
          >
            <ActionForm
              action={archiveStudent}
              label={student.isArchived ? "Restore student" : "Archive student"}
              confirm={
                student.isArchived
                  ? undefined
                  : "Archive this student? Existing enrollment and exam records will be retained."
              }
            >
              <input type="hidden" name="studentId" value={student.id} />
              <input
                type="hidden"
                name="archived"
                value={student.isArchived ? "0" : "1"}
              />
              <p className="text-sm text-slate-500">
                Archiving removes the student from active directory views and
                future exam rosters.
              </p>
            </ActionForm>
          </Modal>
        )}
        {selected && (
          <StudentRecords
            enrollmentId={selected.id}
            studentId={student.id}
            tab={tab}
            user={user}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
