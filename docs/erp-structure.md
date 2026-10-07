# ERP structure and workflows

## Feature ownership

App Router pages authenticate and compose workspaces. Mutations and queries live under features; original action and query entry points remain as compatibility exports.

- students: student records, enrollments, guardians, contacts, promotion, tab queries and related directories.
- academics: academic master configuration, display-name changes and archive recovery.
- examinations: shared examination creation, class examinations, subject settings, marks and state transitions.
- operations: reusable attendance and monthly evaluation register engine, permission checks and calculations.
- achievements: student activities, awards and evidence links.
- reports: approved-source calculations, immutable publication and printable snapshots.
- components/dashboard: shared dialogs, confirmations, forms, filters, tabs and display components.

Existing authentication, Prisma and Neon remain in use. Database migrations live in prisma/migrations-postgresql. The lib query entry points and dashboard action entry points forward to the feature implementations to preserve imports.

## Relationships

Academic year → yearly class (level, optional division, optional stream) → student enrollment.
Students retain permanent IDs across years. Individual Science choices remain on enrollment; houses are independent yearly assignments.
Departments own subject masters; yearly class subject assignments define tutors and stream applicability.
Examination → one or more existing class-level Exam records → frozen subjects, candidates and marks.
Each pre-existing Exam receives its own parent, regardless of matching titles.

## Workflows

- Student record editing, creation, promotion and archive/restore use dialogs. Profile tabs and selected years are URL-addressable.
- Academic setup owns subject masters; examination subject settings affect only that class examination. Marked subject limits/removal are rejected.
- Attendance starts unmarked. Present, Absent and Off are individual records. Off requires a reason and is excluded from Present / (Present + Absent). Drafts require complete marking before submission. Corrections reopen with an audited reason.
- Monthly evaluations snapshot criterion IDs, names, versions and maxima. Blank is incomplete, zero is scored, NA is excluded. Class mentors handle class/study categories; hostel mentors handle hostel behaviour. Administrators approve/lock and reopen.
- Achievement evidence uses HTTPS links. Upload storage is outside this scope.
- Reports publish versioned snapshots from submitted attendance, final/locked non-demo exams and locked monthly evaluations. Print/Save PDF and JSON downloads use the snapshot. Download history is counted.
- Registers and exam marks reject stale revisions. Student/profile/master edits use timestamps or version checks. Database uniqueness protects duplicate daily/monthly registers.

## Migration and verification

The first migration adds models and nullable exam-parent links, backfills one parent per old exam and seeds six initial criteria. The second migration defensively backfills any intervening exam and makes parent links required. A third migration snapshots existing marking tutors onto exam subjects, so later class assignments do not change an examination. All migrations are additive; no student, enrollment, exam or mark is dropped.

Test only with DATABASE_URL and DATABASE_URL_UNPOOLED pointing to the temporary branch. tests/erp-browser.ts refuses to run against a host different from .local/erp-test-url.txt. Its fixtures remain isolated in the expiring test branch; it resets only its dedicated test dates there.

Checks:

- npm run typecheck
- npm run build
- node --import dotenv/config --import tsx --test tests/school-rules.test.ts tests/operations.test.ts
- npx tsx tests/erp-browser.ts (local production preview on port 3110)
- npx tsx scripts/verify-erp-migration.ts <backup-json>

Before production deployment, create a current backup, apply prisma migrate deploy and re-run reconciliation against that backup. Never copy test fixtures or merge test-branch data into production.
