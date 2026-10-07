import { getApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { studentQuery, studentListInclude } from "@/lib/student-queries";
import { csvCell } from "@/lib/school-rules";
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return Response.json({ message: "Please sign in." }, { status: 401 });
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const { year, where } = await studentQuery(user, params);
  const rows = await prisma.studentEnrollment.findMany({ where, include: studentListInclude, orderBy: [{ student: { fullName: "asc" } }, { id: "asc" }], take: 10001 });
  if (rows.length > 10000) return Response.json({ message: "Narrow the filters to export up to 10,000 students." }, { status: 400 });
  const values = [["Student ID", "Name", "Academic year", "Cohort", "Stream", "House", "Roll number", "Status", "Guardian", "Contacts"], ...rows.map(r => [r.student.studentNumber, r.student.fullName, year?.name, r.cohort.displayName, r.studyStream?.name, r.house?.name, r.rollNumber, r.status, r.student.guardians.map(g => g.fullName).join("; "), r.student.contacts.map(c => c.rawValue).join("; ")])];
  return new Response("\uFEFF" + values.map(row => row.map(csvCell).join(",")).join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="students.csv"', "Cache-Control": "no-store" } });
}
