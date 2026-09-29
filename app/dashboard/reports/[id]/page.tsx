import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accessibleEnrollment } from "@/features/students/access";
import type { approvedReport } from "@/features/reports/data";
import PrintButton from "@/components/dashboard/PrintButton";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser("/dashboard/reports");
  if (!["SUPER_ADMIN", "CLASS_MENTOR"].includes(user.role)) notFound();
  const report = await prisma.reportSnapshot.findUnique({
    where: { id: (await params).id },
  });
  if (!report) notFound();
  try {
    await accessibleEnrollment(user, report.enrollmentId);
  } catch {
    notFound();
  }
  const data = report.payload as unknown as Partial<
    Awaited<ReturnType<typeof approvedReport>>
  >;
  return (
    <main className="mx-auto max-w-4xl space-y-6 bg-white p-6 text-slate-900 sm:p-10">
      <div className="flex justify-between print:hidden">
        <Link href="/dashboard/reports">← Reports</Link>
        <PrintButton />
      </div>
      <header className="border-b pb-5">
        <img
          src="/img/top.png"
          alt="Dihliz World School"
          className="mb-4 w-48"
        />
        <h1 className="text-2xl font-bold">
          {report.kind.replaceAll("_", " ")} REPORT
        </h1>
        <p className="mt-2">
          {data.student?.fullName} · {data.student?.studentNumber}
        </p>
        <p>
          {data.year} · {data.class}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Published {report.createdAt.toISOString().slice(0, 10)} · Version{" "}
          {report.version}
        </p>
      </header>
      {data.attendance && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Attendance</h2>
          <p>
            Present {data.attendance.present} · Absent {data.attendance.absent}{" "}
            · Off {data.attendance.off}
          </p>
          <p>
            Attendance:{" "}
            {data.attendance.percentage === null
              ? "—"
              : data.attendance.percentage + "%"}
          </p>
          <p className="mt-2 text-xs">{data.attendance.note}</p>
        </section>
      )}
      {data.exams && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Examinations</h2>
          {data.exams.map((e, i) => (
            <div
              className="mb-4 break-inside-avoid rounded-lg border p-4"
              key={i}
            >
              <h3 className="font-semibold">
                {e.title} · {e.date}
              </h3>
              <p className="text-sm">
                {e.percentage === null ? "—" : e.percentage.toFixed(2) + "%"} ·{" "}
                {e.grade}
              </p>
              <table className="mt-3 w-full text-left text-sm">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Result</th>
                    <th>Maximum</th>
                  </tr>
                </thead>
                <tbody>
                  {e.subjects.map((s, j) => (
                    <tr key={j}>
                      <td>{s.name}</td>
                      <td>{s.mark?.score ?? s.mark?.status ?? "Pending"}</td>
                      <td>{s.maximum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {!data.exams.length && (
            <p className="text-sm">No approved non-demo exam results.</p>
          )}
        </section>
      )}
      {data.performance && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Monthly performance</h2>
          {data.performance.map((p, i) => (
            <p className="border-b py-2 text-sm" key={i}>
              {p.month} · {p.category.replaceAll("_", " ")} ·{" "}
              {p.percentage === null ? "—" : p.percentage + "%"} · {p.remarks}
            </p>
          ))}
          {!data.performance.length && (
            <p className="text-sm">No approved monthly evaluations.</p>
          )}
        </section>
      )}
      {data.achievements && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Achievements</h2>
          {data.achievements.map((a, i) => (
            <p className="border-b py-2 text-sm" key={i}>
              {a.date} · {a.title} · {a.award}
            </p>
          ))}
        </section>
      )}
      <footer className="border-t pt-4 text-xs text-slate-500">
        This published version preserves its approved source data. Academic,
        attendance and behaviour results are reported separately.
      </footer>
    </main>
  );
}
