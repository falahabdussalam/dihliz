import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import ExcelJS from "exceljs";

type SheetMapping = {
  class: string;
  cohort?: string;
  cohortsByStream?: Record<string, string>;
  streams?: Record<string, string>;
};

type Mapping = {
  sourceSpreadsheetId: string;
  academicYear: string;
  houseAliases: Record<string, string>;
  sheets: Record<string, SheetMapping>;
};

function cleanText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : String(value);
  return String(value).trim().replace(/\s+/g, " ");
}

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizePhone(value: string): string | null {
  const stripped = value.replace(/\([^)]*\)/g, "").trim();
  let explicitPlus = stripped.startsWith("+");
  let digits = stripped.replace(/\D/g, "");
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
    explicitPlus = true;
  }
  if (/^[6-9]\d{9}$/.test(digits)) return "+91" + digits;
  if (/^91[6-9]\d{9}$/.test(digits)) return "+" + digits;
  if (explicitPlus && digits.length >= 8 && digits.length <= 15) return "+" + digits;
  if (/^(965|966|971|974)/.test(digits) && digits.length >= 11 && digits.length <= 13) return "+" + digits;
  return null;
}

function splitContacts(value: string, forceReview: boolean) {
  return value
    .split(/[\n,;/]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((rawValue, sortOrder) => {
      const labelMatch = rawValue.match(/\(([^)]+)\)/);
      const normalizedPhone = normalizePhone(rawValue);
      return {
        rawValue,
        normalizedPhone,
        label: labelMatch ? cleanText(labelMatch[1]).toUpperCase() : null,
        sortOrder,
        verificationStatus: forceReview || !normalizedPhone ? "NEEDS_REVIEW" : "UNVERIFIED",
      };
    });
}

async function main() {
  const sourceArgument = process.argv[2];
  const outputArgument = process.argv[3] ?? ".local/student-import/prepared.json";
  if (!sourceArgument) {
    throw new Error("Usage: npm run students:prepare -- workbook.xlsx [output.json]");
  }

  const sourcePath = resolve(sourceArgument);
  const outputPath = resolve(outputArgument);
  const mappingPath = resolve("scripts/student-import/mapping.json");
  const [sourceBytes, mappingBytes] = await Promise.all([readFile(sourcePath), readFile(mappingPath)]);
  const mapping = JSON.parse(mappingBytes.toString("utf8").replace(/^\uFEFF/, "")) as Mapping;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(sourcePath);

  const records: Array<Record<string, unknown>> = [];
  const warnings: Array<Record<string, unknown>> = [];
  for (const worksheet of workbook.worksheets) {
    const sheetMapping = mapping.sheets[worksheet.name];
    if (!sheetMapping) throw new Error("Unmapped sheet: " + worksheet.name);
    const headers = worksheet.getRow(1).values as unknown[];
    const headerNames = headers.slice(1).map(cleanText);
    const required = ["StudentID", "Name", "ParentName", "Mobile", "Class", "Group"];
    if (sheetMapping.streams) required.push("Stream");
    if (headerNames.length !== required.length || required.some((header) => !headerNames.includes(header))) {
      throw new Error("Unexpected headers on " + worksheet.name + ": " + JSON.stringify(headerNames));
    }

    for (let rowNumber = 2; rowNumber <= worksheet.actualRowCount; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      const values = Object.fromEntries(
        headerNames.map((header, index) => [header, row.getCell(index + 1).value])
      );
      if (!Object.values(values).some((value) => cleanText(value))) continue;
      const fullName = cleanText(values.Name);
      if (!fullName) throw new Error("Missing student name at " + worksheet.name + "!" + rowNumber);

      const sourceClass = cleanText(values.Class).toUpperCase();
      if (!sourceClass) {
        warnings.push({ sheet: worksheet.name, rowNumber, field: "Class", reason: "Used sheet mapping for blank class" });
      } else if (sourceClass !== sheetMapping.class) {
        throw new Error("Class conflicts with sheet at " + worksheet.name + "!" + rowNumber);
      }

      const sourceStream = cleanText(values.Stream).toUpperCase();
      const cohortCode = sheetMapping.cohort ?? sheetMapping.cohortsByStream?.[sourceStream];
      if (!cohortCode) throw new Error("Cannot resolve cohort at " + worksheet.name + "!" + rowNumber);
      const studyStreamCode = sheetMapping.streams?.[sourceStream] ?? null;
      if (sheetMapping.streams && !studyStreamCode) {
        throw new Error("Cannot resolve study stream at " + worksheet.name + "!" + rowNumber);
      }

      const sourceGroup = cleanText(values.Group).toUpperCase();
      const houseCode = mapping.houseAliases[sourceGroup] ?? null;
      if (sourceGroup && !houseCode) throw new Error("Unknown house at " + worksheet.name + "!" + rowNumber);

      const mobileValue = values.Mobile;
      const mobileIsFormula = Boolean(
        mobileValue && typeof mobileValue === "object" && "formula" in mobileValue
      );
      const cachedMobile = mobileIsFormula
        ? (mobileValue as { result?: unknown }).result
        : mobileValue;
      if (mobileIsFormula) {
        warnings.push({
          sheet: worksheet.name,
          rowNumber,
          field: "Mobile",
          reason: "Used cached formula result and marked contact for review",
        });
      }
      const mobileText = cachedMobile === null || cachedMobile === undefined
        ? ""
        : String(cachedMobile).trim();
      const contacts = mobileText ? splitContacts(mobileText, mobileIsFormula) : [];
      const fingerprintPayload = {
        sheetName: worksheet.name,
        rowNumber,
        fullName,
        parentName: cleanText(values.ParentName) || null,
        cohortCode,
        studyStreamCode,
        houseCode,
        contacts,
      };
      records.push({
        ...fingerprintPayload,
        sourceFingerprint: sha256(JSON.stringify(fingerprintPayload)),
      });
    }
  }

  const missingSheets = Object.keys(mapping.sheets).filter(
    (sheetName) => !workbook.worksheets.some((worksheet) => worksheet.name === sheetName)
  );
  if (missingSheets.length) throw new Error("Expected sheets missing: " + missingSheets.join(", "));
  if (records.length !== 200) throw new Error("Expected 200 students, found " + records.length);

  const manifest = {
    version: 1,
    mappingVersion: sha256(mappingBytes).slice(0, 16),
    sourceSpreadsheetId: mapping.sourceSpreadsheetId,
    sourceChecksum: sha256(sourceBytes),
    academicYear: mapping.academicYear,
    records,
    warnings,
  };
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(manifest, null, 2), { encoding: "utf8", mode: 0o600 });
  console.log(JSON.stringify({
    output: outputPath,
    students: records.length,
    guardians: records.filter((record) => record.parentName).length,
    contacts: records.reduce((sum, record) => sum + (record.contacts as unknown[]).length, 0),
    warnings: warnings.length,
    sourceChecksum: manifest.sourceChecksum,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
