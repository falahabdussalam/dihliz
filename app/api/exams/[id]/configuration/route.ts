import { getApiUser } from "@/lib/auth";
import { examWorkspace } from "@/lib/exam-queries";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user)
    return Response.json({ message: "Please sign in." }, { status: 401 });
  if (user.role !== "SUPER_ADMIN")
    return Response.json(
      { message: "Administrator access required." },
      { status: 403 },
    );
  const workspace = await examWorkspace(user, (await context.params).id);
  if (!workspace)
    return Response.json({ message: "Exam unavailable." }, { status: 404 });
  const { exam, subjects } = workspace;
  if (!exam.markEntryDueDate || !exam.publishDate)
    return Response.json(
      {
        message:
          "Set entry due and publish dates before exporting a configuration.",
      },
      { status: 400 },
    );
  return Response.json(
    {
      version: 1,
      title: exam.title,
      date: exam.date.toISOString().slice(0, 10),
      markEntryDueDate: exam.markEntryDueDate.toISOString().slice(0, 10),
      publishDate: exam.publishDate.toISOString().slice(0, 10),
      cohorts: [
        {
          cohortId: exam.cohortId,
          subjects: subjects.map((s) => ({
            id: s.cohortSubjectId,
            maxMarks: s.maxMarks,
            passMarks: s.passMarks,
          })),
        },
      ],
    },
    {
      headers: {
        "Content-Disposition": 'attachment; filename="exam-configuration.json"',
        "Cache-Control": "no-store",
      },
    },
  );
}
