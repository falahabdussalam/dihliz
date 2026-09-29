import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ActionForm from "@/components/dashboard/ActionForm";
import { Panel, linkClass } from "@/components/dashboard/SchoolUI";
import { requireClass } from "@/features/operations/access";
import { attendanceDates } from "@/features/operations/period";
import { openAttendancePeriod } from "@/features/operations/actions";
import AttendanceMatrix from "@/features/operations/AttendanceMatrix";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requirePageUser("/dashboard/attendance"),
    q = await searchParams;
  let cohort, dates: string[];
  try {
    cohort = await requireClass(user, q.cohort ?? "");
    dates = attendanceDates(
      q.mode ?? "daily",
      q.date ?? "",
      cohort.academicYear.startDate.toISOString().slice(0, 10),
      cohort.academicYear.endDate.toISOString().slice(0, 10),
    );
  } catch {
    notFound();
  }
  const registers = await prisma.attendanceRegister.findMany({
    where: {
      cohortId: cohort.id,
      date: { in: dates.map((d) => new Date(d + "T00:00:00Z")) },
    },
    include: { entries: { orderBy: { fullName: "asc" } } },
    orderBy: { date: "asc" },
  });
  return (
    <DashboardLayout
      currentUser={user}
      title={cohort.displayName + " attendance"}
      eyebrow={cohort.academicYear.name}
    >
      <div className="space-y-5">
        <Link
          className={linkClass}
          href={"/dashboard/attendance?year=" + cohort.academicYearId}
        >
          Change class or period
        </Link>
        <Panel
          title={
            (q.mode ?? "daily") + " entry · " + dates[0] + " to " + dates.at(-1)
          }
        >
          {registers.length < dates.length && (
            <ActionForm
              action={openAttendancePeriod}
              label="Open missing daily registers"
            >
              <input type="hidden" name="cohortId" value={cohort.id} />
              <input type="hidden" name="mode" value={q.mode ?? "daily"} />
              <input type="hidden" name="date" value={q.date} />
              <p className="text-sm text-slate-500">
                {dates.length - registers.length} dates have no register.
                Opening them preserves the current class roster without
                assigning attendance.
              </p>
            </ActionForm>
          )}
          <AttendanceMatrix
            dates={dates}
            registers={registers.map((r) => ({
              id: r.id,
              revision: r.revision,
              status: r.status,
              date: r.date.toISOString().slice(0, 10),
              entries: r.entries.map((e) => ({
                id: e.id,
                enrollmentId: e.enrollmentId,
                fullName: e.fullName,
                studentNumber: e.studentNumber,
                status: e.status,
                reason: e.reason,
              })),
            }))}
          />
        </Panel>
      </div>
    </DashboardLayout>
  );
}
