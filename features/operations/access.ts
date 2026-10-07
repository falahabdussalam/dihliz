import { prisma } from "@/lib/prisma";
import type { AuthUser } from "@/lib/auth";
import { schoolScope } from "@/lib/school-access";
import { canManageRegister, type Category } from "./rules";
export async function operationScope(
  user: AuthUser,
  yearId: string,
  category?: Category,
) {
  const scope = await schoolScope(user, yearId);
  return {
    ...scope,
    cohorts: scope.cohorts.filter((c) =>
      canManageRegister(user.role, scope.explicit.includes(c.id), category),
    ),
  };
}
export async function requireClass(
  user: AuthUser,
  cohortId: string,
  category?: Category,
) {
  const cohort = await prisma.academicCohort.findUnique({
    where: { id: cohortId },
    include: { academicYear: true },
  });
  if (!cohort || cohort.isArchived || cohort.academicYear.isArchived)
    throw new Error("Class is unavailable.");
  const scope = await operationScope(user, cohort.academicYearId, category);
  if (!scope.cohorts.some((c) => c.id === cohortId))
    throw new Error("You do not have access to this register.");
  return cohort;
}
