import "dotenv/config";
import { Client, types } from "pg";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
types.setTypeParser(1082, (value) => value);
const examTables = [
  "Examination",
  "Exam",
  "ExamSubject",
  "ExamCandidate",
  "ExamMark",
] as const;
const preservedTables = [
  "Student",
  "StudentEnrollment",
  "Subject",
  "CohortSubject",
  "AcademicCohort",
  "AcademicYear",
  "AttendanceEntry",
  "PerformanceEntry",
  "Achievement",
] as const;
const containsExams =
  "CASE WHEN jsonb_typeof(payload->'exams') = 'array' THEN jsonb_array_length(payload->'exams') > 0 ELSE false END";
async function main() {
  const raw = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is required.");
  const url = new URL(raw);
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new Error("Expected PostgreSQL.");
  const host = url.hostname.replace("-pooler.", ".");
  const apply = process.argv.includes("--apply"),
    expected = process.argv
      .find((a) => a.startsWith("--expected-host="))
      ?.split("=")
      .slice(1)
      .join("=");
  if (apply && expected !== host)
    throw new Error(
      "Deletion requires --expected-host matching the configured database host.",
    );
  if (
    ["require", "prefer", "verify-ca"].includes(
      url.searchParams.get("sslmode") ?? "",
    )
  )
    url.searchParams.set("sslmode", "verify-full");
  const client = new Client({
    connectionString: url.toString(),
    connectionTimeoutMillis: 15000,
    query_timeout: 60000,
  });
  await client.connect();
  const counts = async (tables: readonly string[]) => {
    const result: Record<string, number> = {};
    for (const table of tables)
      result[table] = (
        await client.query('SELECT count(*)::int AS count FROM "' + table + '"')
      ).rows[0].count;
    return result;
  };
  try {
    if (!apply) {
      console.log(
        JSON.stringify(
          {
            mode: "preview",
            host,
            examData: await counts(examTables),
            savedReports: (
              await client.query(
                "SELECT kind,count(*)::int AS count FROM \"ReportSnapshot\" WHERE kind='EXAMS' OR (" +
                  containsExams +
                  ") GROUP BY kind",
              )
            ).rows,
            preserved: await counts(preservedTables),
          },
          null,
          2,
        ),
      );
      return;
    }
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ");
    await client.query("SET LOCAL lock_timeout='10s'");
    await client.query(
      'LOCK TABLE "Examination", "Exam", "ExamSubject", "ExamCandidate", "ExamMark", "ReportSnapshot", "ReportDownload" IN SHARE ROW EXCLUSIVE MODE',
    );
    const preservedBefore = await counts(preservedTables),
      tables: Record<string, unknown[]> = {};
    for (const table of examTables)
      tables[table] = (
        await client.query('SELECT * FROM "' + table + '"')
      ).rows;
    tables.ReportSnapshot = (
      await client.query(
        `SELECT * FROM "ReportSnapshot" WHERE kind='EXAMS' OR (${containsExams})`,
      )
    ).rows;
    tables.ReportDownload = (
      await client.query(
        `SELECT d.* FROM "ReportDownload" d JOIN "ReportSnapshot" r ON r.id=d."reportId" WHERE r.kind='EXAMS'`,
      )
    ).rows;
    const backup = resolve(
      ".local/backups/exam-cleanup-" +
        new Date().toISOString().replace(/[:.]/g, "-") +
        ".json",
    );
    await mkdir(resolve(".local/backups"), { recursive: true });
    const serialized = JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        host,
        reason: "User requested removal of all exams and related marks",
        schema: await readFile("prisma/schema.prisma", "utf8"),
        preservedBefore,
        tables,
      },
      null,
      2,
    );
    await writeFile(backup, serialized, { flag: "wx", mode: 0o600 });
    const checksum = createHash("sha256").update(serialized).digest("hex");
    if (
      createHash("sha256")
        .update(await readFile(backup))
        .digest("hex") !== checksum
    )
      throw new Error("Backup verification failed.");
    const deleted: Record<string, number> = {};
    deleted.ReportDownload =
      (
        await client.query(
          `DELETE FROM "ReportDownload" WHERE "reportId" IN (SELECT id FROM "ReportSnapshot" WHERE kind='EXAMS')`,
        )
      ).rowCount ?? 0;
    deleted.ReportSnapshot =
      (await client.query(`DELETE FROM "ReportSnapshot" WHERE kind='EXAMS'`))
        .rowCount ?? 0;
    const reportsCleared =
      (
        await client.query(
          `UPDATE "ReportSnapshot" SET payload=jsonb_set(payload,'{exams}','[]'::jsonb) WHERE ${containsExams}`,
        )
      ).rowCount ?? 0;
    for (const table of [
      "ExamMark",
      "ExamCandidate",
      "ExamSubject",
      "Exam",
      "Examination",
    ])
      deleted[table] =
        (await client.query('DELETE FROM "' + table + '"')).rowCount ?? 0;
    const remaining = await counts(examTables);
    if (Object.values(remaining).some((n) => n !== 0))
      throw new Error("Examination cleanup verification failed.");
    const residual = (
      await client.query(
        `SELECT count(*)::int AS count FROM "ReportSnapshot" WHERE kind='EXAMS' OR (${containsExams})`,
      )
    ).rows[0].count;
    if (residual !== 0) throw new Error("Saved exam marks remain in reports.");
    const preservedAfter = await counts(preservedTables);
    if (JSON.stringify(preservedBefore) !== JSON.stringify(preservedAfter))
      throw new Error("Unrelated data changed during cleanup.");
    await client.query("COMMIT");
    console.log(
      JSON.stringify(
        {
          mode: "applied",
          host,
          backup,
          checksum,
          deleted,
          reportsCleared,
          remaining,
          preserved: preservedAfter,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Cleanup failed");
  process.exitCode = 1;
});
