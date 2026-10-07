"use client";
import Select from "@/components/dashboard/Select";

import ConfirmButton from "@/components/dashboard/ConfirmButton";
import { Dialog } from "@/components/dashboard/Dialog";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiShield, FiUserCheck, FiUsers } from "react-icons/fi";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { AuthUser } from "@/lib/auth";
import { roleLabel } from "@/lib/permissions";
import { UserRole } from "@/generated/prisma/enums";

type Staff = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  assignments: Array<{
    id: string;
    academicYear: string;
    cohort: string | null;
    department: string | null;
  }>;
};

type Props = {
  currentUser: AuthUser;
  staff: Staff[];
  activeYear: { id: string; name: string } | null;
  cohorts: Array<{ id: string; displayName: string }>;
  departments: Array<{ id: string; name: string }>;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export default function StaffAccess({
  currentUser,
  staff,
  activeYear,
  cohorts,
  departments,
}: Props) {
  const router = useRouter();
  const canManage = currentUser.role === UserRole.SUPER_ADMIN;
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    UserRole.CLASS_MENTOR,
  );
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(
    null,
  );

  const save = async (payload: unknown) => {
    setSaving(true);
    setNotice(null);

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setNotice({
          error: true,
          text: result.message ?? "Unable to save staff account.",
        });
        return false;
      }
      setNotice({ error: false, text: "Staff access updated successfully." });
      router.refresh();
      return true;
    } catch {
      setNotice({ error: true, text: "Unable to reach the server." });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const createStaff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeYear) return;
    const form = new FormData(event.currentTarget);
    const saved = await save({
      action: "create",
      fullName: form.get("fullName"),
      email: form.get("email"),
      temporaryPassword: form.get("temporaryPassword"),
      role: selectedRole,
      academicYearId: activeYear.id,
      cohortId: form.get("cohortId") || null,
      departmentId: form.get("departmentId") || null,
    });
    if (saved) setShowForm(false);
  };

  return (
    <DashboardLayout
      currentUser={currentUser}
      title="Staff access"
      eyebrow={
        activeYear ? "Academic year " + activeYear.name : "Access control"
      }
    >
      {notice && (
        <div
          className={
            notice.error
              ? "mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              : "mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          }
        >
          {notice.text}
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-3">
        <Metric
          label="Staff accounts"
          value={staff.length}
          icon={<FiUsers />}
        />
        <Metric
          label="Active accounts"
          value={staff.filter((item) => item.isActive).length}
          icon={<FiUserCheck />}
        />
        <Metric label="Role types" value={5} icon={<FiShield />} />
      </section>

      <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#071a33]">
              Staff accounts and scope
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Assign staff to the academic year, cohort or department they
              manage.
            </p>
          </div>
          {canManage && activeYear && (
            <button
              onClick={() => setShowForm((value) => !value)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#071a33] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <FiPlus /> Add staff
            </button>
          )}
        </div>

        {showForm && (
          <Dialog
            title="Add staff"
            open={showForm}
            onClose={() => setShowForm(false)}
          >
            <form
              data-pending={saving}
              onSubmit={createStaff}
              className="grid gap-4 border-b border-slate-200 bg-slate-50 p-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {notice?.error && (
                <p role="alert" className="text-sm text-red-700 md:col-span-2">
                  {notice.text}
                </p>
              )}
              <Field label="Full name">
                <input name="fullName" required className={inputClass} />
              </Field>
              <Field label="Email address">
                <input
                  name="email"
                  type="email"
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Temporary password">
                <input
                  name="temporaryPassword"
                  type="password"
                  minLength={10}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Role">
                <Select
                  name="role"
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(event.target.value as UserRole)
                  }
                  className={inputClass}
                >
                  <option value={UserRole.DEPARTMENT_HEAD}>
                    Department Head
                  </option>
                  <option value={UserRole.CLASS_MENTOR}>Class Mentor</option>
                  <option value={UserRole.HOSTEL_MENTOR}>Hostel Mentor</option>
                  <option value={UserRole.SUBJECT_TUTOR}>Subject Tutor</option>
                </Select>
              </Field>
              {selectedRole === UserRole.DEPARTMENT_HEAD ? (
                <Field label="Department">
                  <Select name="departmentId" required className={inputClass}>
                    <option value="">Select department</option>
                    {departments.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : (
                <Field label="Cohort">
                  <Select name="cohortId" required className={inputClass}>
                    <option value="">Select cohort</option>
                    {cohorts.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.displayName}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              <div className="flex items-end">
                <button
                  disabled={saving}
                  className="w-full rounded-lg bg-[#0b7a4b] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Create account"}
                </button>
              </div>
            </form>
          </Dialog>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Staff member</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Assigned scope</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-[#071a33]">
                      {item.fullName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {roleLabel(item.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.assignments.length ? (
                      item.assignments.map((assignment) => (
                        <p key={assignment.id}>
                          {assignment.academicYear} |{" "}
                          {assignment.cohort ??
                            assignment.department ??
                            "All school"}
                        </p>
                      ))
                    ) : (
                      <span className="text-slate-400">Full system access</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        item.isActive
                          ? "text-xs font-semibold text-emerald-700"
                          : "text-xs font-semibold text-red-600"
                      }
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canManage && item.id !== currentUser.id && (
                      <ConfirmButton
                        disabled={saving}
                        label={item.isActive ? "Deactivate" : "Activate"}
                        description={"Change access for " + item.fullName + "?"}
                        onConfirm={() =>
                          save({
                            action: "toggleActive",
                            id: item.id,
                            isActive: !item.isActive,
                          })
                        }
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <article className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </span>
      <span>
        <strong className="block text-2xl font-bold text-[#071a33]">
          {value}
        </strong>
        <span className="text-sm font-normal text-slate-500">{label}</span>
      </span>
    </article>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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
