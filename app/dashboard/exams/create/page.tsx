import { redirect, notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { schoolScope } from "@/lib/school-access";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateExaminationForm from "@/features/examinations/CreateExaminationForm";
export const metadata = { title: "Create examination - Dihliz" };
export default async function CreateExam({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const user = await requirePageUser("/dashboard/exams/create");
  if (user.role !== "SUPER_ADMIN") redirect("/dashboard/exams");
  const { year: yearId } = await searchParams;
  const year = await prisma.academicYear.findFirst({
    where: { isArchived: false, ...(yearId ? { id: yearId } : {}) },
    orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
  });
  if (!year) notFound();
  const [scope, previousNames, subjects] = await Promise.all([
    schoolScope(user, year.id),
    prisma.examination.findMany({
      select: { title: true },
      distinct: ["title"],
      orderBy: { title: "asc" },
      take: 100,
    }),
    prisma.cohortSubject.findMany({
      where: {
        cohort: { academicYearId: year.id, isArchived: false },
        isArchived: false,
        subject: { isArchived: false },
      },
      select: {
        id: true,
        cohortId: true,
        maxMarks: true,
        passMarks: true,
        studyStreamCode: true,
        subject: { select: { name: true } },
      },
      orderBy: { subject: { name: "asc" } },
    }),
  ]);
  return (
    <DashboardLayout
      currentUser={user}
      title="Create examination"
      eyebrow={year.name}
    >
      <CreateExaminationForm
        year={{
          id: year.id,
          name: year.name,
          startDate: year.startDate.toISOString().slice(0, 10),
          endDate: year.endDate.toISOString().slice(0, 10),
        }}
        classes={scope.cohorts.map((c) => ({
          id: c.id,
          displayName: c.displayName,
        }))}
        previousNames={previousNames}
        subjects={subjects.map(({ subject, ...s }) => ({
          ...s,
          name: subject.name,
        }))}
      />
    </DashboardLayout>
  );
}
