import "dotenv/config";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Client, types } from "pg";
types.setTypeParser(1114, (value) => new Date(value + "Z"));
types.setTypeParser(1082, (value) => value);
async function main() {
  const backup = JSON.parse(
    await readFile(
      process.argv[2] ??
        ".local/backups/school-postgresql-2026-09-27T15-58-22-222Z.json",
      "utf8",
    ),
  );
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  });
  await client.connect();
  try {
    for (const table of [
      "Student",
      "StudentEnrollment",
      "StudentGuardian",
      "StudentContact",
      "Exam",
      "ExamSubject",
      "ExamCandidate",
      "ExamMark",
    ]) {
      const old = backup.tables[table];
      if (!old) continue;
      const current = (await client.query('SELECT * FROM "' + table + '"'))
        .rows;
      const byId = new Map(current.map((r) => [r.id, r]));
      for (const record of old) {
        const row = byId.get(record.id);
        assert.ok(row, "Missing " + table + " ID");
        for (const key of Object.keys(record))
          assert.deepEqual(
            JSON.parse(JSON.stringify(row[key])),
            record[key],
            table + " changed field " + key,
          );
      }
      console.log(
        "PASS preserved " +
          old.length +
          " " +
          table +
          " records and all original fields",
      );
    }
    const links = await client.query(
      'SELECT count(*)::int AS missing FROM "Exam" WHERE "eventId" IS NULL',
    );
    assert.equal(links.rows[0].missing, 0);
    const parents = await client.query(
      'SELECT count(DISTINCT "eventId")::int AS count FROM "Exam" WHERE "id"=ANY($1::text[])',
      [backup.tables.Exam.map((e: { id: string }) => e.id)],
    );
    assert.equal(parents.rows[0].count, backup.tables.Exam.length);
    console.log("PASS one independent parent per historical exam");
  } finally {
    await client.end();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
