import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/metadata";
import PageContent from "./page-content";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = createPageMetadata("Dashboard - Dihliz World School");

export default async function Page() {
  const currentUser = await requirePageUser("/dashboard/staff");
  if (currentUser.role !== "SUPER_ADMIN") notFound();
  const data = await loadData();
  return <PageContent {...data} currentUser={currentUser} />;
}

async function loadData() {
  const activeYear = await prisma.academicYear.findFirst({
    where: { isActive: true, isArchived: false },
  });
  const [staff, cohorts, departments] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ isActive: "desc" }, { fullName: "asc" }],
      include: {
        assignments: {
          include: { academicYear: true, cohort: true, department: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    activeYear
      ? prisma.academicCohort.findMany({
          where: { academicYearId: activeYear.id, isArchived: false },
          orderBy: { displayName: "asc" },
        })
      : [],
    prisma.department.findMany({
      where: { isArchived: false },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    activeYear: activeYear
      ? { id: activeYear.id, name: activeYear.name }
      : null,
    staff: staff.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      assignments: user.assignments.map((assignment) => ({
        id: assignment.id,
        academicYear: assignment.academicYear.name,
        cohort: assignment.cohort?.displayName ?? null,
        department: assignment.department?.name ?? null,
      })),
    })),
    cohorts: cohorts.map(({ id, displayName }) => ({ id, displayName })),
    departments: departments.map(({ id, name }) => ({ id, name })),
  };
}
