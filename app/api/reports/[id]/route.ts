import { NextResponse } from "next/server";
import { getPageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accessibleEnrollment } from "@/features/students/access";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getPageUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "CLASS_MENTOR"].includes(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const report = await prisma.reportSnapshot.findUnique({
    where: { id: (await params).id },
  });
  if (!report)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await accessibleEnrollment(user, report.enrollmentId);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.reportDownload.create({
    data: { reportId: report.id, actorId: user.id },
  });
  return new Response(
    JSON.stringify(
      {
        kind: report.kind,
        version: report.version,
        publishedAt: report.createdAt,
        data: report.payload,
      },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition":
          'attachment; filename="dihliz-report-' +
          report.id +
          "-v" +
          report.version +
          '.json"',
        "Cache-Control": "private, no-store",
      },
    },
  );
}
