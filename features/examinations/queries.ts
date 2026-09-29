import { prisma } from "@/lib/prisma";
import type { AuthUser } from "@/lib/auth";
import {
  schoolScope,
  canReadExamSubject,
  canEditExamSubject,
} from "@/lib/school-access";
export async function examWorkspace(user: AuthUser, examId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      cohort: { include: { academicYear: true } },
      subjects: {
        include: {
          markingTutor: { select: { id: true, fullName: true } },
          cohortSubject: { include: { subject: true } },
        },
        orderBy: { name: "asc" },
      },
      candidates: {
        include: { marks: true },
        orderBy: [{ fullName: "asc" }, { id: "asc" }],
      },
    },
  });
  if (!exam) return null;
  const scope = await schoolScope(user, exam.cohort.academicYearId);
  if (!scope.cohorts.some((c) => c.id === exam.cohortId)) return null;
  const subjects = exam.subjects.filter((s) =>
    canReadExamSubject(user, scope, exam.cohortId, {
      ...s.cohortSubject,
      tutorId: s.markingTutorId,
    }),
  );
  if (!scope.admin && !subjects.length) return null;
  const ids = new Set(subjects.map((s) => s.id));
  return {
    exam,
    scope,
    subjects: subjects.map((s) => ({
      ...s,
      canEdit: canEditExamSubject(user, scope, exam.cohortId, {
        ...s.cohortSubject,
        tutorId: s.markingTutorId,
      }),
    })),
    candidates: exam.candidates.map((c) => ({
      ...c,
      marks: c.marks.filter((m) => ids.has(m.examSubjectId)),
    })),
    partial: subjects.length !== exam.subjects.length,
  };
}
