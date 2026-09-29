import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/metadata";
import PageContent from "./page-content";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = createPageMetadata("Dashboard - Dihliz World School");

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  const currentUser = await requirePageUser("/dashboard/academic");
  if (currentUser.role !== "SUPER_ADMIN") notFound();
  const data = await loadData((await searchParams).archived === "1");
  return <PageContent {...data} currentUser={currentUser} />;
}

async function loadData(archived = false) {
  const [years, classLevels, divisions, streams] = await Promise.all([
    prisma.academicYear.findMany({
      where: archived ? {} : { isArchived: false },
      orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
      include: {
        cohorts: {
          where: archived ? {} : { isArchived: false },
          orderBy: { displayName: "asc" },
          include: { classLevel: true, division: true, stream: true },
        },
      },
    }),
    prisma.classLevel.findMany({
      where: { isArchived: false },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.division.findMany({
      where: { isArchived: false },
      orderBy: { code: "asc" },
    }),
    prisma.stream.findMany({
      where: { isArchived: false },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    years: years.map((year) => ({
      id: year.id,
      updatedAt: year.updatedAt.toISOString(),
      isArchived: year.isArchived,
      name: year.name,
      startDate: year.startDate.toISOString().slice(0, 10),
      endDate: year.endDate.toISOString().slice(0, 10),
      isActive: year.isActive,
      cohorts: year.cohorts.map((cohort) => ({
        id: cohort.id,
        updatedAt: cohort.updatedAt.toISOString(),
        isArchived: cohort.isArchived,
        code: cohort.code,
        displayName: cohort.displayName,
        classLevel: { id: cohort.classLevel.id, name: cohort.classLevel.name },
        division: cohort.division
          ? { id: cohort.division.id, name: cohort.division.name }
          : null,
        stream: cohort.stream
          ? { id: cohort.stream.id, name: cohort.stream.name }
          : null,
      })),
    })),
    classLevels: classLevels.map(({ id, name, code }) => ({ id, name, code })),
    divisions: divisions.map(({ id, name, code }) => ({ id, name, code })),
    streams: streams.map(({ id, name, code }) => ({ id, name, code })),
  };
}
