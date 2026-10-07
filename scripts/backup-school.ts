import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Client, types } from "pg";
types.setTypeParser(1114, value => new Date(value + "Z"));
types.setTypeParser(1082, value => value);
async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL, connectionTimeoutMillis: 15000, query_timeout: 30000 });
  await client.connect();
  const tables: Record<string, unknown[]> = {};
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const result = await client.query<{ table_name: string }>("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name");
    for (const { table_name } of result.rows) {
      tables[table_name] = (await client.query('SELECT * FROM public."' + table_name.replace(/"/g, '""') + '"')).rows;
    }
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { await client.end(); }
  const directory = join(process.cwd(), ".local", "backups");
  await mkdir(directory, { recursive: true });
  const output = join(directory, "school-postgresql-" + new Date().toISOString().replace(/[:.]/g, "-") + ".json");
  await writeFile(output, JSON.stringify({ createdAt: new Date().toISOString(), provider: "postgresql", schema: await readFile("prisma/schema.prisma", "utf8"), tables }, null, 2), { flag: "wx", mode: 0o600 });
  console.log("Backed up " + Object.keys(tables).length + " public application tables to " + output);
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Backup failed"); process.exitCode = 1; });
