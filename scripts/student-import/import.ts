import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { UserRole } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const contactSchema = z.object({
  rawValue: z.string().min(1).max(255),
  normalizedPhone: z.string().max(32).nullable(),
  label: z.string().max(40).nullable(),
  sortOrder: z.number().int().nonnegative(),
  verificationStatus: z.enum(["UNVERIFIED", "NEEDS_REVIEW"]),
});

const recordSchema = z.object({
  sheetName: z.string().min(1).max(100),
  rowNumber: z.number().int().min(2),
  fullName: z.string().min(1).max(160),
  parentName: z.string().min(1).max(160).nullable(),
  cohortCode: z.string().min(1).max(60),
  studyStreamCode: z.string().min(1).max(40).nullable(),
  houseCode: z.string().min(1).max(40).nullable(),
  contacts: z.array(contactSchema),
  sourceFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
});

const manifestSchema = z.object({
  version: z.literal(1),
  mappingVersion: z.string().length(16),
  sourceSpreadsheetId: z.string().min(1).max(191),
  sourceChecksum: z.string().regex(/^[a-f0-9]{64}$/),
  academicYear: z.string().min(4).max(20),
  records: z.array(recordSchema).length(200),
  warnings: z.array(z.object({
    sheet: z.string(),
    rowNumber: z.number().int(),
    field: z.string(),
    reason: z.string(),
  })),
});

const houseNames: Record<string, string> = {
  ANDALUS_FALCONS: "Andalus Falcons",
  CORDOBIC_TITANS: "Cordobic Titans",
  GRANADIC_GUARDIANS: "Granadic Guardians",
};

async function loadManifest(path: string) {
  return manifestSchema.parse(JSON.parse(await readFile(resolve(path), "utf8")));
}

async function main() {
  const manifestPath = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
  const apply = process.argv.includes("--apply");
  if (!manifestPath) {
    throw new Error("Usage: npm run students:import -- manifest.json [--apply]");
  }
  const manifest = await loadManifest(manifestPath);

  const academicYear = await prisma.academicYear.findUnique({
    where: { name: manifest.academicYear },
    include: { cohorts: { where: { isArchived: false } } },
  });
  if (!academicYear || academicYear.isArchived) {
    throw new Error("Target academic year is missing or archived: " + manifest.academicYear);
  }

  const cohortByCode = new Map(academicYear.cohorts.map((cohort) => [cohort.code, cohort]));
  const requiredCohorts = [...new Set(manifest.records.map((record) => record.cohortCode))];
  const missingCohorts = requiredCohorts.filter((code) => !cohortByCode.has(code));
  if (missingCohorts.length) {
    throw new Error("Missing target cohorts: " + missingCohorts.join(", "));
  }

  const streamCodes = [...new Set(manifest.records.map((record) => record.studyStreamCode).filter((code): code is string => Boolean(code)))];
  const streams = await prisma.stream.findMany({ where: { code: { in: streamCodes }, isArchived: false } });
  const streamByCode = new Map(streams.map((stream) => [stream.code, stream]));
  const missingStreams = streamCodes.filter((code) => !streamByCode.has(code));
  if (missingStreams.length) {
    throw new Error("Missing study streams: " + missingStreams.join(", "));
  }

  const existingBatch = await prisma.studentImportBatch.findUnique({
    where: {
      sourceSpreadsheetId_sourceChecksum_academicYearId: {
        sourceSpreadsheetId: manifest.sourceSpreadsheetId,
        sourceChecksum: manifest.sourceChecksum,
        academicYearId: academicYear.id,
      },
    },
    include: { _count: { select: { rows: true } } },
  });
  const existingStudentCount = await prisma.student.count();
  if (!existingBatch && existingStudentCount > 0) {
    throw new Error(
      "Students already exist but this exact source snapshot has no import batch. Refusing a new snapshot to prevent duplicate profiles."
    );
  }

  const cohortCounts = Object.fromEntries(
    requiredCohorts.map((code) => [code, manifest.records.filter((record) => record.cohortCode === code).length])
  );
  const houseCounts = {
    ANDALUS_FALCONS: manifest.records.filter((record) => record.houseCode === "ANDALUS_FALCONS").length,
    CORDOBIC_TITANS: manifest.records.filter((record) => record.houseCode === "CORDOBIC_TITANS").length,
    GRANADIC_GUARDIANS: manifest.records.filter((record) => record.houseCode === "GRANADIC_GUARDIANS").length,
    UNASSIGNED: manifest.records.filter((record) => !record.houseCode).length,
  };

  if (!apply) {
    console.log(JSON.stringify({
      mode: "dry-run",
      sourceChecksum: manifest.sourceChecksum,
      academicYear: academicYear.name,
      students: manifest.records.length,
      guardians: manifest.records.filter((record) => record.parentName).length,
      contacts: manifest.records.reduce((sum, record) => sum + record.contacts.length, 0),
      contactsNeedingReview: manifest.records.flatMap((record) => record.contacts).filter((contact) => contact.verificationStatus === "NEEDS_REVIEW").length,
      cohortCounts,
      houseCounts,
      warnings: manifest.warnings,
      existingBatch: existingBatch ? { status: existingBatch.status, importedRows: existingBatch._count.rows } : null,
      wouldApply: !existingBatch && existingStudentCount === 0,
    }, null, 2));
    return;
  }

  if (existingBatch?.status === "COMPLETED") {
    if (existingBatch._count.rows !== manifest.records.length) {
      throw new Error("Completed import batch has an unexpected row count.");
    }
    console.log("No changes: this exact source snapshot was already imported.");
    return;
  }

  for (const [code, name] of Object.entries(houseNames)) {
    await prisma.house.upsert({
      where: { code },
      update: { name, isArchived: false },
      create: { code, name },
    });
  }
  const houses = await prisma.house.findMany({ where: { code: { in: Object.keys(houseNames) }, isArchived: false } });
  const houseByCode = new Map(houses.map((house) => [house.code, house]));
  const operator = await prisma.user.findFirst({
    where: { role: UserRole.SUPER_ADMIN, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  const batch = existingBatch
    ? await prisma.studentImportBatch.update({
        where: { id: existingBatch.id },
        data: { status: "RUNNING", errorMessage: null, completedAt: null },
      })
    : await prisma.studentImportBatch.create({
        data: {
          sourceSpreadsheetId: manifest.sourceSpreadsheetId,
          sourceChecksum: manifest.sourceChecksum,
          mappingVersion: manifest.mappingVersion,
          academicYearId: academicYear.id,
          operatorId: operator?.id,
        },
      });

  let created = 0;
  let skipped = 0;
  try {
    for (const record of manifest.records) {
      const priorRow = await prisma.studentImportRow.findUnique({
        where: { batchId_sheetName_rowNumber: { batchId: batch.id, sheetName: record.sheetName, rowNumber: record.rowNumber } },
      });
      if (priorRow && priorRow.sourceFingerprint !== record.sourceFingerprint) {
        throw new Error("Source row changed during resume: " + record.sheetName + "!" + record.rowNumber);
      }
      if (priorRow?.result === "CREATED") {
        skipped += 1;
        continue;
      }

      try {
        await prisma.$transaction(async (transaction) => {
          const sequence = await transaction.studentNumberSequence.create({ data: {} });
          const studentNumber = "DWS-" + sequence.id.toString().padStart(6, "0");
          const student = await transaction.student.create({
            data: {
              sequenceId: sequence.id,
              studentNumber,
              fullName: record.fullName,
            },
          });
          if (record.parentName) {
            await transaction.studentGuardian.create({
              data: { studentId: student.id, fullName: record.parentName },
            });
          }
          if (record.contacts.length) {
            await transaction.studentContact.createMany({
              data: record.contacts.map((contact) => ({
                studentId: student.id,
                rawValue: contact.rawValue,
                normalizedPhone: contact.normalizedPhone,
                label: contact.label,
                sortOrder: contact.sortOrder,
                verificationStatus: contact.verificationStatus,
              })),
            });
          }
          await transaction.studentEnrollment.create({
            data: {
              studentId: student.id,
              academicYearId: academicYear.id,
              cohortId: cohortByCode.get(record.cohortCode)!.id,
              studyStreamId: record.studyStreamCode ? streamByCode.get(record.studyStreamCode)!.id : null,
              houseId: record.houseCode ? houseByCode.get(record.houseCode)!.id : null,
            },
          });
          await transaction.studentImportRow.upsert({
            where: { batchId_sheetName_rowNumber: { batchId: batch.id, sheetName: record.sheetName, rowNumber: record.rowNumber } },
            update: { sourceFingerprint: record.sourceFingerprint, studentId: student.id, result: "CREATED", message: null },
            create: {
              batchId: batch.id,
              sheetName: record.sheetName,
              rowNumber: record.rowNumber,
              sourceFingerprint: record.sourceFingerprint,
              studentId: student.id,
              result: "CREATED",
            },
          });
        }, { timeout: 15_000 });
        created += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message.slice(0, 500) : "Unknown row import error";
        await prisma.studentImportRow.upsert({
          where: { batchId_sheetName_rowNumber: { batchId: batch.id, sheetName: record.sheetName, rowNumber: record.rowNumber } },
          update: { sourceFingerprint: record.sourceFingerprint, studentId: null, result: "FAILED", message },
          create: {
            batchId: batch.id,
            sheetName: record.sheetName,
            rowNumber: record.rowNumber,
            sourceFingerprint: record.sourceFingerprint,
            result: "FAILED",
            message,
          },
        });
        throw new Error(record.sheetName + "!" + record.rowNumber + ": " + message);
      }
    }

    await prisma.studentImportBatch.update({
      where: { id: batch.id },
      data: { status: "COMPLETED", completedAt: new Date(), errorMessage: null },
    });
    await prisma.auditLog.create({
      data: {
        actorId: operator?.id,
        action: "IMPORT",
        entityType: "StudentImportBatch",
        entityId: batch.id,
        details: { created, skipped, sourceChecksum: manifest.sourceChecksum, academicYear: manifest.academicYear },
      },
    });
    console.log(JSON.stringify({ mode: "apply", batchId: batch.id, created, skipped }, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Student import failed";
    await prisma.studentImportBatch.update({
      where: { id: batch.id },
      data: { status: "FAILED", errorMessage: message.slice(0, 65535) },
    });
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
