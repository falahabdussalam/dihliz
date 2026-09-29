import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Modal from "@/components/dashboard/Dialog";
import ActionForm from "@/components/dashboard/ActionForm";
import {
  Panel,
  Field,
  Badge,
  inputClass,
  linkClass,
  Stats,
} from "@/components/dashboard/SchoolUI";
import { requireClass } from "./access";
import {
  categories,
  criteriaSchema,
  scoresSchema,
  attendanceSummary,
  performanceSummary,
} from "./rules";
import { saveRegister } from "./actions";
import RegisterGrid from "./RegisterGrid";
export default async function Workspace({
  kind,
  id,
}: {
  kind: "attendance" | "performance";
  id: string;
}) {
  const user = await requirePageUser("/dashboard/" + kind);
  const register =
    kind === "attendance"
      ? await prisma.attendanceRegister.findUnique({
          where: { id },
          include: { entries: { orderBy: { fullName: "asc" } } },
        })
      : await prisma.performanceRegister.findUnique({
          where: { id },
          include: { entries: { orderBy: { fullName: "asc" } } },
        });
  if (!register) notFound();
  let cohort;
  try {
    cohort = await requireClass(
      user,
      register.cohortId,
      "category" in register ? register.category : undefined,
    );
  } catch {
    notFound();
  }
  const criteria =
    "criteria" in register ? criteriaSchema.parse(register.criteria) : [];
  const entries = register.entries.map((e) => ({
    id: e.id,
    fullName: e.fullName,
    studentNumber: e.studentNumber,
    ...("scores" in e
      ? { scores: scoresSchema.parse(e.scores), remarks: e.remarks }
      : { status: e.status, reason: e.reason }),
  }));
  const summary = attendanceSummary(
    entries.map((e) => ({ status: "status" in e ? e.status : null })),
  );
  const transitions =
    register.status === "DRAFT"
      ? []
      : kind === "attendance"
        ? ["reopen"]
        : user.role === "SUPER_ADMIN"
          ? register.status === "SUBMITTED"
            ? ["lock", "reopen"]
            : ["reopen"]
          : [];
  return (
    <DashboardLayout
      currentUser={user}
      title={cohort.displayName}
      eyebrow={
        kind === "attendance"
          ? "Daily attendance · " +
            ("date" in register ? register.date.toISOString().slice(0, 10) : "")
          : "Monthly performance · " +
            ("category" in register
              ? categories[register.category] +
                " · " +
                register.month.toISOString().slice(0, 7)
              : "")
      }
    >
      <div className="space-y-5">
        <div className="flex justify-between">
          <Link
            className={linkClass}
            href={"/dashboard/" + kind + "?year=" + cohort.academicYearId}
          >
            ← Registers
          </Link>
          <Badge>{register.status}</Badge>
        </div>
        {kind === "attendance" && (
          <Stats
            items={[
              {
                label: "Present / Absent / Off",
                value:
                  summary.present +
                  " / " +
                  summary.absent +
                  " / " +
                  summary.off,
              },
              { label: "Unmarked", value: summary.missing },
              {
                label: "Attendance",
                value:
                  summary.percentage === null ? "—" : summary.percentage + "%",
              },
            ]}
          />
        )}
        <Panel
          title={
            register.status === "DRAFT" ? "Mark register" : "Submitted register"
          }
        >
          {register.status === "DRAFT" ? (
            <RegisterGrid
              id={id}
              revision={register.revision}
              kind={kind}
              criteria={criteria}
              entries={entries}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="p-3">Student</th>
                    {kind === "attendance" ? (
                      <>
                        <th>Status</th>
                        <th>Reason</th>
                      </>
                    ) : (
                      <>
                        {criteria.map((c) => (
                          <th key={c.id} className="min-w-[140px] p-2">
                            {c.name}
                            <span className="block text-xs font-normal">
                              Maximum {c.maximum}
                            </span>
                          </th>
                        ))}
                        <th>Percentage</th>
                        <th>Remarks</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="p-3">
                        {e.fullName}
                        <span className="block text-xs text-slate-500">
                          {e.studentNumber}
                        </span>
                      </td>
                      {"status" in e ? (
                        <>
                          <td>{e.status ?? "Unmarked"}</td>
                          <td>{e.reason}</td>
                        </>
                      ) : (
                        <>
                          {criteria.map((c) => (
                            <td key={c.id} className="p-2">
                              {e.scores[c.id]?.na
                                ? "NA"
                                : (e.scores[c.id]?.value ?? "Unmarked")}
                            </td>
                          ))}
                          <td>
                            {performanceSummary(criteria, e.scores)
                              .percentage === null
                              ? "—"
                              : performanceSummary(criteria, e.scores)
                                  .percentage + "%"}
                          </td>
                          <td>{e.remarks}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <div className="flex gap-3">
          {transitions.map((intent) => (
            <Modal
              key={intent}
              title={
                intent === "lock"
                  ? "Approve evaluation"
                  : "Reopen for correction"
              }
            >
              <ActionForm
                action={saveRegister}
                label={intent === "lock" ? "Approve and lock" : "Reopen"}
                confirm={
                  intent === "lock"
                    ? "Approve and lock this submitted evaluation?"
                    : undefined
                }
              >
                <input type="hidden" name="registerId" value={id} />
                <input type="hidden" name="kind" value={kind} />
                <input
                  type="hidden"
                  name="revision"
                  value={register.revision}
                />
                <input type="hidden" name="intent" value={intent} />
                {intent === "reopen" && (
                  <Field label="Correction reason">
                    <textarea
                      name="reason"
                      minLength={5}
                      maxLength={500}
                      className={inputClass}
                      required
                    />
                  </Field>
                )}
              </ActionForm>
            </Modal>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
