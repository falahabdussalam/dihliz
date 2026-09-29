import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../lib/prisma";
import { UserRole } from "../generated/prisma/enums";

async function main() {
  const academicYear = await prisma.academicYear.upsert({
    where: { name: "2026-2027" },
    update: { startDate: new Date("2026-06-01"), endDate: new Date("2027-03-31"), isActive: true },
    create: {
      name: "2026-2027",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      isActive: true,
    },
  });

  await prisma.academicYear.updateMany({
    where: { id: { not: academicYear.id } },
    data: { isActive: false },
  });

  const classLevels = [
    { code: "8", name: "Class 8", sortOrder: 8 },
    { code: "9", name: "Class 9", sortOrder: 9 },
    { code: "10", name: "Class 10", sortOrder: 10 },
    { code: "PLUS1", name: "+1", sortOrder: 11 },
    { code: "PLUS2", name: "+2", sortOrder: 12 },
  ];

  for (const level of classLevels) {
    await prisma.classLevel.upsert({
      where: { code: level.code },
      update: level,
      create: level,
    });
  }

  for (const division of [
    { code: "A", name: "Division A" },
    { code: "B", name: "Division B" },
  ]) {
    await prisma.division.upsert({
      where: { code: division.code },
      update: division,
      create: division,
    });
  }

  const streams = [
    { code: "SCIENCE", name: "Science" },
    { code: "COMMERCE", name: "Commerce" },
    { code: "COMPUTER_SCIENCE", name: "Computer Science" },
    { code: "BIOLOGY_SCIENCE", name: "Biology Science" },
  ];

  for (const stream of streams) {
    await prisma.stream.upsert({
      where: { code: stream.code },
      update: stream,
      create: stream,
    });
  }

  const departments = [
    { code: "GENERAL", name: "General" },
    { code: "SCIENCE", name: "Science" },
    { code: "COMMERCE", name: "Commerce" },
    { code: "COMPUTER_SCIENCE", name: "Computer Science" },
    { code: "BIOLOGY_SCIENCE", name: "Biology Science" },
    { code: "ISLAMIC", name: "Islamic Department" },
    { code: "HOSTEL", name: "Hostel" },
  ];

  for (const department of departments) {
    await prisma.department.upsert({
      where: { code: department.code },
      update: department,
      create: department,
    });
  }

  const levels = await prisma.classLevel.findMany();
  const divisions = await prisma.division.findMany();
  const savedStreams = await prisma.stream.findMany();

  const levelId = Object.fromEntries(levels.map((item) => [item.code, item.id]));
  const divisionId = Object.fromEntries(divisions.map((item) => [item.code, item.id]));
  const streamId = Object.fromEntries(savedStreams.map((item) => [item.code, item.id]));

  const cohorts = [
    { code: "8", displayName: "8", classLevelId: levelId["8"] },
    { code: "9-A", displayName: "9A", classLevelId: levelId["9"], divisionId: divisionId.A },
    { code: "9-B", displayName: "9B", classLevelId: levelId["9"], divisionId: divisionId.B },
    { code: "10", displayName: "10", classLevelId: levelId["10"] },
    { code: "PLUS1-SCIENCE", displayName: "+1 Science", classLevelId: levelId.PLUS1, streamId: streamId.SCIENCE },
    { code: "PLUS1-COMMERCE", displayName: "+1 Commerce", classLevelId: levelId.PLUS1, streamId: streamId.COMMERCE },
    { code: "PLUS2-COMPUTER-SCIENCE", displayName: "+2 Computer Science", classLevelId: levelId.PLUS2, streamId: streamId.COMPUTER_SCIENCE },
    { code: "PLUS2-BIOLOGY-SCIENCE", displayName: "+2 Biology Science", classLevelId: levelId.PLUS2, streamId: streamId.BIOLOGY_SCIENCE },
    { code: "PLUS2-COMMERCE", displayName: "+2 Commerce", classLevelId: levelId.PLUS2, streamId: streamId.COMMERCE },
  ];

  for (const cohort of cohorts) {
    await prisma.academicCohort.upsert({
      where: {
        academicYearId_code: {
          academicYearId: academicYear.id,
          code: cohort.code,
        },
      },
      update: { ...cohort, isArchived: false },
      create: { ...cohort, academicYearId: academicYear.id },
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "sysadmin@dihlizworldschool.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) throw new Error("SEED_ADMIN_PASSWORD is required to seed the administrator.");
  const passwordHash = await hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {
      fullName: "Dihliz Super Admin",
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      email: adminEmail.toLowerCase(),
      fullName: "Dihliz Super Admin",
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      mustChangePassword: true,
    },
  });

  console.log("Seeded academic year, 9 cohorts, departments, and the super admin.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
