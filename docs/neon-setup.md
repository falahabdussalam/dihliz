# Neon database

Project: `wandering-water-98879127`. Workspace branch: `production`.

The dashboard now uses PostgreSQL with Prisma's `@prisma/adapter-pg`. Neon CLI stores the pooled `DATABASE_URL` and direct `DATABASE_URL_UNPOOLED` in the ignored `.env`. Prisma Migrate uses the direct URL; the application uses the pooled URL. Set these same variables in the hosting provider before deploying the web application.

`neon.ts` declares `auth: true`. `neon deploy` provisions this backend configuration; it does not deploy the Next.js website. The existing school login, password hashes and role checks remain in use. Neon Auth is provisioned but replacing the school's login with its SDK is a separate change.

## Migrations and data

PostgreSQL migration history lives in `prisma/migrations-postgresql`, selected by `prisma.config.ts`. The previous MySQL migrations under `prisma/migrations` remain as historical reference and must not be applied to PostgreSQL.

The MySQL source was backed up to `.local/backups/school-modules-2026-09-27T14-54-37-369Z.json` before switching connections. It includes all 24 application tables plus the old migration history. The old MySQL database is retained.

`scripts/migrate-mysql-backup.ts` imports that snapshot into empty PostgreSQL application tables in one transaction, preserves IDs and timestamps, checks every field and row count, and restores the permanent-student sequence above the old MySQL counter. It does not copy MySQL migration history or modify Neon-managed auth tables. Repeating an import into nonempty tables is rejected; `--verify` checks an existing transfer.

Commands:

- `npm exec prisma migrate deploy`: apply PostgreSQL migrations.
- `npm run db:backup:school`: take a private, consistent logical backup of public application tables and the Prisma schema.
- `npm exec tsx -- scripts/migrate-mysql-backup.ts BACKUP.json --verify`: reconcile against the source snapshot before further application writes.
- `npm run students:verify -- .local/student-import/prepared.json`: verify the original student import.

Migration testing uses a temporary branch with an expiry and explicit environment overrides. Never point the browser fixture test at production. The normal workspace stays linked to production.
