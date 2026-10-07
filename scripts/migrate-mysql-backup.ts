import "dotenv/config";
import { readFile } from "node:fs/promises";
import { Client, types } from "pg";
import assert from "node:assert/strict";
// Prisma stores DateTime as UTC timestamp without time zone.
types.setTypeParser(1114, value => new Date(value + "Z"));
types.setTypeParser(1082, value => value);

const order = ["User", "AcademicYear", "ClassLevel", "Division", "Stream", "Department", "House", "StudentNumberSequence", "Student", "AcademicCohort", "StudentGuardian", "StudentContact", "StudentEnrollment", "StaffAssignment", "Subject", "CohortSubject", "Exam", "ExamSubject", "ExamCandidate", "ExamMark", "Session", "AuditLog", "StudentImportBatch", "StudentImportRow"];
const quote = (value: string) => '"' + value.replace(/"/g, '""') + '"';
type Row = Record<string, unknown>;
type Backup = { tables: Record<string, { ddl: string; rows: Row[] }> };
function normalize(value: unknown, type: string): unknown {
  if (value === null || value === undefined) return null;
  if (type === "boolean") return value === true || value === 1 || value === "1";
  if (type === "bigint") return String(value);
  if (["integer", "smallint", "double precision", "real", "numeric"].includes(type)) return Number(value);
  if (type === "jsonb" || type === "json") {
    const object = typeof value === "string" ? JSON.parse(value) : value;
    const stable = (item: any): any => Array.isArray(item) ? item.map(stable) : item && typeof item === "object" ? Object.fromEntries(Object.keys(item).sort().map(k => [k, stable(item[k])])) : item;
    return stable(object);
  }
  if (type === "date") return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
  if (type.startsWith("timestamp")) return value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();
  return value;
}
async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Usage: tsx scripts/migrate-mysql-backup.ts BACKUP.json [--verify]");
  const backup = JSON.parse(await readFile(file, "utf8")) as Backup;
  // Windows MySQL stores table names in lowercase; PostgreSQL preserves quoted names.
  backup.tables = Object.fromEntries(Object.entries(backup.tables).map(([table, data]) => [order.find(t => t.toLowerCase() === table.toLowerCase()) ?? table, data]));
  assert.deepEqual(Object.keys(backup.tables).filter(t => t !== "_prisma_migrations").sort(), [...order].sort(), "Unexpected source table set");
  const client = new Client({ connectionString: process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL_UNPOOLED, connectionTimeoutMillis: 20000 });
  await client.connect();
  try {
    const columns = (await client.query<{ table_name: string; column_name: string; data_type: string }>("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' ORDER BY ordinal_position")).rows;
    const metadata = new Map(order.map(t => [t, columns.filter(c => c.table_name === t)]));
    const verify = async () => {
      const counts: Record<string, number> = {};
      for (const table of order) {
        const expected = backup.tables[table].rows;
        const actual = (await client.query("SELECT * FROM public." + quote(table))).rows as Row[];
        assert.equal(actual.length, expected.length, table + " row count");
        const byId = new Map(actual.map(r => [String(r.id), r]));
        const fields = metadata.get(table)!;
        assert.ok(fields.length, "Missing table " + table);
        for (const row of expected) {
          const saved = byId.get(String(row.id));
          assert.ok(saved, "Missing row in " + table);
          for (const col of fields) assert.deepEqual(normalize(saved[col.column_name], col.data_type), normalize(row[col.column_name], col.data_type), table + "." + col.column_name + " mismatch");
        }
        counts[table] = actual.length;
      }
      console.log(JSON.stringify({ verified: true, counts }, null, 2));
    };
    if (process.argv.includes("--verify")) { await verify(); return; }
    await client.query("BEGIN");
    try {
      // Empty target only. Never merge over or delete existing school data.
      for (const table of order) {
        const count = await client.query("SELECT count(*)::int AS count FROM public." + quote(table));
        if (count.rows[0].count !== 0) throw new Error("Target is not empty: " + table + ". Use --verify for a completed import.");
      }
      for (const table of order) {
        const fields = metadata.get(table)!;
        assert.ok(fields.length, "Missing target table " + table);
        const rows = backup.tables[table].rows;
        for (let offset = 0; offset < rows.length; offset += 100) {
          const values: unknown[] = [];
          const tuples = rows.slice(offset, offset + 100).map(row => "(" + fields.map(col => {
            let value = normalize(row[col.column_name], col.data_type);
            if (value !== null && ["json", "jsonb"].includes(col.data_type)) value = JSON.stringify(value);
            values.push(value);
            return "$" + values.length;
          }).join(",") + ")");
          await client.query("INSERT INTO public." + quote(table) + " (" + fields.map(c => quote(c.column_name)).join(",") + ") VALUES " + tuples.join(","), values);
        }
      }
      const sequenceRows = backup.tables.StudentNumberSequence.rows;
      const maximum = sequenceRows.reduce((max, row) => BigInt(String(row.id)) > max ? BigInt(String(row.id)) : max, BigInt(0));
      const sourceNext = BigInt(backup.tables.StudentNumberSequence.ddl.match(/AUTO_INCREMENT=(\d+)/)?.[1] ?? "1");
      const next = sourceNext > maximum ? sourceNext : maximum + BigInt(1);
      await client.query('SELECT setval(pg_get_serial_sequence(\'public."StudentNumberSequence"\', \'id\'), $1, false)', [next.toString()]);
      await verify();
      await client.query("COMMIT");
      console.log("Imported atomically. Next student sequence: " + next);
    } catch (error) { await client.query("ROLLBACK"); throw error; }
  } finally { await client.end(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Migration failed"); process.exitCode = 1; });
