# Students and examinations

## Routes and workflow

- `/dashboard/students`: search permanent IDs, names, guardians and phone numbers; filter by year, cohort, house and enrollment status; paginate and export the filtered directory.
- `/dashboard/students/[id]`: edit profiles, HTTPS photo links, guardians, contacts and verification; edit the selected year's cohort, study stream, house, roll number and status; inspect academic history; archive or restore.
- New students receive a permanent sequential `DWS-000001` style ID. Existing imported IDs remain unchanged. IDs are never regenerated during promotion.
- To promote, filter to a single source cohort, select students and choose a higher class in a later year. The transaction creates new enrollments and marks the source enrollments completed. House carry-forward is optional; roll numbers are not copied. Duplicate yearly enrollment is rejected.
- `/dashboard/exams/subjects`: create subject masters under departments, then assign subjects and tutors to a year/cohort. Set maximum and pass marks. Combined Science cohorts support Biology/Computer Science applicability.
- `/dashboard/exams`: select a cohort and create an examination with selected subjects, date, maximum and pass marks. The active roster and subject settings are copied to preserve historical results after profile, enrollment or subject changes.
- `/dashboard/exams/[id]`: enter a score, `ABSENT`, `NA`, or leave a draft cell blank. Save all permitted cells together; export results as CSV. Finalization requires every applicable cell. Final results may be reopened; locked results cannot be edited or reopened. Only drafts may be archived.

## Access

All pages, actions and exports check the current database session. Super administrators manage students, subject settings and examination status. Class mentors can read their explicitly assigned cohorts and exam results. Hostel mentors can read students in explicitly assigned cohorts. Department heads access subjects in their assigned departments. Subject tutors enter/read only their assigned subjects. Tutors and department heads see partial totals when some exam subjects are outside their scope. Hidden fields and client controls are not trusted for authorization.

Marks saves use a revision check in a transaction. A stale browser must refresh before saving. Profile and enrollment edits also detect concurrent changes. Mutations create audit records. Archiving preserves academic history.

## Calculation policy

The initial fixed grade scale uses percentage of applicable maximum marks: A+ ≥90, A ≥80, B+ ≥70, B ≥60, C ≥50, D ≥40, E below 40. Any scored subject below its configured pass mark, or any absence, yields F. `ABSENT` contributes zero with its maximum retained. `NA` excludes that subject from the denominator. Missing applicable marks yield Incomplete; an entirely excluded result yields N/A. This scale is implemented in `lib/school-rules.ts`; confirm the school's official scale before publishing real results.

## Database and verification

Migration `20260912090000_student_exams` adds six examination tables and their foreign keys. It was applied to the existing local XAMPP database after a complete 19-table logical backup under `.local/backups/`. It does not delete or reimport the 200 existing students. No real subjects or exams are invented; configure them through the new screens.

- `npm run db:backup:school`: private logical backup of the school tables.
- `npm run test:school`: calculation, input validation, CSV safety and authorization rule checks.
- `npm run test:school:browser`: temporary database fixtures exercising student creation/editing/contact verification, subject setup, marks, scope restrictions, revision conflicts, final/lock and promotion. Requires a running app at `http://localhost:3108` (override `SCHOOL_TEST_URL`) and Playwright with Edge. Set `PLAYWRIGHT_MODULE` to the installed Playwright package path outside the bundled Windows runtime. Fixtures are removed in `finally`; run against a development database.
- `npm run typecheck` and `npm run build`: TypeScript and production checks.

Photo entry currently accepts a hosted HTTPS URL; file uploading and configurable grading schemes are separate extensions. Existing imported contact values remain unverified until reviewed.
