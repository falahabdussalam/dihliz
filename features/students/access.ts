import { prisma } from "@/lib/prisma";
import { schoolScope } from "@/lib/school-access";
import type { AuthUser } from "@/lib/auth";
export async function accessibleEnrollment(user: AuthUser, id: string) {
  const e = await prisma.studentEnrollment.findUnique({
    where: { id },
    include: { student: true, cohort: true },
  });
  if (!e) throw new Error("Enrollment unavailable.");
  const scope = await schoolScope(user, e.academicYearId);
  if (!scope.admin && !scope.cohorts.some((c) => c.id === e.cohortId))
    throw new Error("You do not have access to this student.");
  return e;
}
