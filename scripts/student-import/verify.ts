import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { prisma } from "../../lib/prisma";

async function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) throw new Error("Usage: npm run students:verify -- manifest.json");
  const manifest = JSON.parse(await readFile(resolve(manifestPath), "utf8")) as {
    sourceSpreadsheetId: string;
    sourceChecksum: string;
    academicYear: string;
    records: Array<{
      sheetName: string;
      rowNumber: number;
      sourceFingerprint: string;
      cohortCode: string;
      houseCode: string | null;
      studyStreamCode: string | null;
      contacts: unknown[];
      parentName: string | null;
    }>;
  };
  const year = await prisma.academicYear.findUnique({ where: { name: manifest.academicYear } });
  if (!year) throw new Error("Academic year not found.");

  const batch = await prisma.studentImportBatch.findUnique({
    where: {
      sourceSpreadsheetId_sourceChecksum_academicYearId: {
        sourceSpreadsheetId: manifest.sourceSpreadsheetId,
        sourceChecksum: manifest.sourceChecksum,
        academicYearId: year.id,
      },
    },
    include: { rows: true },
  });
  if (!batch || batch.status !== "COMPLETED") throw new Error("Completed import batch not found.");

  const [students, enrollments, guardians, contacts, contactsNeedingReview, enrollmentRows] = await Promise.all([
    prisma.student.findMany({ select: { id: true, studentNumber: true } }),
    prisma.studentEnrollment.count({ where: { academicYearId: year.id } }),
    prisma.studentGuardian.count(),
    prisma.studentContact.count(),
    prisma.studentContact.count({ where: { verificationStatus: "NEEDS_REVIEW" } }),
    prisma.studentEnrollment.findMany({
      where: { academicYearId: year.id },
      select: { cohort: { select: { code: true } }, house: { select: { code: true } }, studyStream: { select: { code: true } } },
    }),
  ]);

  const expected = {
    students: manifest.records.length,
    guardians: manifest.records.filter((record) => record.parentName).length,
    contacts: manifest.records.reduce((sum, record) => sum + record.contacts.length, 0),
    contactsNeedingReview: manifest.records
      .flatMap((record) => record.contacts as Array<{ verificationStatus?: string }>)
      .filter((contact) => contact.verificationStatus === "NEEDS_REVIEW").length,
  };
  const actual = { students: students.length, enrollments, guardians, contacts, contactsNeedingReview, importRows: batch.rows.length };
  if (actual.students !== expected.students || actual.enrollments !== expected.students ||
      actual.guardians !== expected.guardians || actual.contacts !== expected.contacts ||
      actual.contactsNeedingReview !== expected.contactsNeedingReview ||
      actual.importRows !== expected.students) {
    throw new Error("Count reconciliation failed: " + JSON.stringify({ expected, actual }));
  }
  const manifestFingerprintByRow = new Map(
    manifest.records.map((record) => [record.sheetName + ":" + record.rowNumber, record.sourceFingerprint])
  );
  if (batch.rows.some((row) =>
    row.result !== "CREATED" ||
    manifestFingerprintByRow.get(row.sheetName + ":" + row.rowNumber) !== row.sourceFingerprint
  )) {
    throw new Error("Import row result or source fingerprint reconciliation failed.");
  }
  if (new Set(students.map((student) => student.studentNumber)).size !== students.length ||
      students.some((student) => !/^DWS-\d{6,}$/.test(student.studentNumber))) {
    throw new Error("Generated student number validation failed.");
  }

  function counts(values: Array<string | null>) {
    return Object.fromEntries([...new Set(values)].sort((a, b) => (a ?? "").localeCompare(b ?? "")).map((value) => [value ?? "UNASSIGNED", values.filter((item) => item === value).length]));
  }
  const expectedCohorts = counts(manifest.records.map((record) => record.cohortCode));
  const actualCohorts = counts(enrollmentRows.map((record) => record.cohort.code));
  const expectedHouses = counts(manifest.records.map((record) => record.houseCode));
  const actualHouses = counts(enrollmentRows.map((record) => record.house?.code ?? null));
  if (JSON.stringify(expectedCohorts) !== JSON.stringify(actualCohorts) ||
      JSON.stringify(expectedHouses) !== JSON.stringify(actualHouses)) {
    throw new Error("Cohort or house reconciliation failed: " + JSON.stringify({ expectedCohorts, actualCohorts, expectedHouses, actualHouses }));
  }

  const plusOneScience = enrollmentRows.filter((record) => record.cohort.code === "PLUS1-SCIENCE");
  const plusOneStreams = counts(plusOneScience.map((record) => record.studyStream?.code ?? null));
  if (plusOneStreams.COMPUTER_SCIENCE !== 19 || plusOneStreams.BIOLOGY_SCIENCE !== 9) {
    throw new Error("+1 Science stream reconciliation failed: " + JSON.stringify(plusOneStreams));
  }
  console.log(JSON.stringify({ verified: true, batchId: batch.id, expected, actual, cohortCounts: actualCohorts, houseCounts: actualHouses, plusOneStreams }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
