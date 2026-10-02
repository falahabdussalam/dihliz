import { prisma } from "@/lib/prisma";
import type { AuthUser } from "@/lib/auth";
export async function schoolScope(user: AuthUser, yearId: string) {
  const admin = user.role === "SUPER_ADMIN";
  const assignments = admin
    ? []
    : await prisma.staffAssignment.findMany({
        where: { userId: user.id, academicYearId: yearId, role: user.role },
        select: { cohortId: true, departmentId: true },
      });
  const departmentIds =
    user.role === "DEPARTMENT_HEAD"
      ? assignments.flatMap((a) => (a.departmentId ? [a.departmentId] : []))
      : [];
  const explicit = assignments.flatMap((a) => (a.cohortId ? [a.cohortId] : []));
  const cohorts = await prisma.academicCohort.findMany({
    where: {
      academicYearId: yearId,
      isArchived: false,
      ...(admin
        ? {}
        : {
            OR: [
              { id: { in: explicit } },
              {
                subjects: {
                  some: {
                    isArchived: false,
                    ...(user.role === "SUBJECT_TUTOR"
                      ? { tutorId: user.id }
                      : { subject: { departmentId: { in: departmentIds } } }),
                  },
                },
              },
            ],
          }),
    },
    include: { classLevel: true, stream: true },
    orderBy: [{ classLevel: { sortOrder: "asc" } }, { displayName: "asc" }],
  });
  return { admin, cohorts, departmentIds, explicit };
}
export function canReadExamSubject(
  user: AuthUser,
  scope: { departmentIds: string[]; explicit: string[] },
  cohortId: string,
  subject: { tutorId: string | null; subject: { departmentId: string } },
) {
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "CLASS_MENTOR" && scope.explicit.includes(cohortId))
    return true;
  if (user.role === "SUBJECT_TUTOR") return subject.tutorId === user.id;
  if (user.role === "DEPARTMENT_HEAD")
    return scope.departmentIds.includes(subject.subject.departmentId);
  return false;
}
export function canEditExamSubject(
  user: AuthUser,
  scope: { departmentIds: string[]; explicit: string[] },
  cohortId: string,
  subject: { tutorId: string | null; subject: { departmentId: string } },
) {
  return canReadExamSubject(user, scope, cohortId, subject);
}
