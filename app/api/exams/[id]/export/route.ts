import { getApiUser } from "@/lib/auth";
import { examWorkspace } from "@/lib/exam-queries";
import { applies, examResult, csvCell } from "@/lib/school-rules";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getApiUser(request);
  if (!user) return Response.json({ message: "Please sign in." }, { status: 401 });
  const { id } = await context.params, workspace = await examWorkspace(user, id);
  if (!workspace) return Response.json({ message: "Exam unavailable." }, { status: 404 });
  const { exam, subjects, candidates } = workspace;
  const rows = [["Exam", "Status", "Scope", "Student ID", "Name", ...subjects.map(s => s.name + " / " + s.maxMarks), "Total", "Maximum", "Percentage", "Grade"], ...candidates.map(c => {
    const result = examResult(subjects, c.marks, c.studyStreamCode);
    return [exam.title, exam.status, workspace.partial ? "Assigned subjects only" : "All subjects", c.studentNumber, c.fullName, ...subjects.map(s => {
      if (!applies(s, c.studyStreamCode)) return "Not applicable to stream";
      const mark = c.marks.find(m => m.examSubjectId === s.id);
      return !mark ? "Pending" : mark.status === "SCORED" ? mark.score : mark.status;
    }), result.total, result.maximum, result.missing ? "" : result.percentage, result.grade];
  })];
  return new Response("\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="exam-results.csv"', "Cache-Control": "no-store" } });
}
