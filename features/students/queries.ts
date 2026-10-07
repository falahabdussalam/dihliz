import { prisma } from "@/lib/prisma";
import { schoolScope } from "@/lib/school-access";
import type { AuthUser } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma/client";
export type StudentFilters = {
  year?: string;
  cohort?: string;
  house?: string;
  q?: string;
  status?: string;
  page?: string;
  archived?: string;
};
export async function studentQuery(user: AuthUser, filters: StudentFilters) {
  const years = await prisma.academicYear.findMany({
    where: { isArchived: false },
    orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
  });
  const year = filters.year
    ? years.find((y) => y.id === filters.year)
    : years[0];
  const scope = await schoolScope(user, year?.id ?? "");
  const houses = await prisma.house.findMany({
    where: { isArchived: false },
    orderBy: { name: "asc" },
  });
  const statuses = ["ACTIVE", "INACTIVE", "WITHDRAWN", "COMPLETED"] as const;
  const status = statuses.find((s) => s === filters.status);
  const q = filters.q?.trim().slice(0, 120) ?? "";
  const where: Prisma.StudentEnrollmentWhereInput = {
    academicYearId: year?.id ?? "",
    cohortId: {
      in: scope.cohorts
        .filter((c) => !filters.cohort || c.id === filters.cohort)
        .map((c) => c.id),
    },
    ...(filters.house === "unassigned"
      ? { houseId: null }
      : filters.house
        ? { houseId: filters.house }
        : {}),
    ...(status ? { status } : {}),
    student: {
      isArchived: scope.admin && filters.archived === "1",
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { studentNumber: { contains: q, mode: "insensitive" } },
              {
                guardians: {
                  some: { fullName: { contains: q, mode: "insensitive" } },
                },
              },
              {
                contacts: {
                  some: {
                    OR: [
                      { rawValue: { contains: q, mode: "insensitive" } },
                      { normalizedPhone: { contains: q, mode: "insensitive" } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    },
  };
  return { years, year, scope, houses, where };
}
export const studentListInclude = {
  student: {
    include: {
      guardians: true,
      contacts: { orderBy: { sortOrder: "asc" as const } },
    },
  },
  cohort: true,
  house: true,
  studyStream: true,
} satisfies Prisma.StudentEnrollmentInclude;
