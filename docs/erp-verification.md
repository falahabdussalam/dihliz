# ERP implementation verification

Verified on 28 September 2026.

- Production build: passed (Next.js 16.2.12).
- Calculation and authorization unit tests: 12 passed.
- Browser workflows: passed on the temporary Neon branch using the production build.
- Desktop, tablet and mobile dialog checks: passed; Escape, unsaved changes and focus restoration verified.
- Student creation, permanent IDs, profile, guardian and contact dialogs: passed.
- Student tab bookmarks and all examination workspace tabs: passed.
- Attendance: blank submission rejected; bulk Off stores individual records; stale saves and cross-class requests rejected.
- Performance: zero and NA remain distinct, submission and approval pass, criterion version edits preserve existing register maxima.
- Shared exams: separate class rosters/settings; mark entry saves; marked subject setting changes rejected; per-exam marking assignments preserve class assignments and enforce tutor scope.
- Achievements, report publication, downloads, print view and immutable report snapshots: passed.

## Database rollout

Test branch: codex-erp-redesign (expires automatically). Production migrations applied after test validation and a fresh backup.

Backup: .local/backups/school-postgresql-2026-09-28T04-32-22-641Z.json (ignored by Git; contains private school data).

Production reconciliation preserved every original field of:

| Record | Count |
| --- | ---: |
| Students | 200 |
| Enrollments | 200 |
| Guardians | 198 |
| Contacts | 194 |
| Exams | 27 |
| Exam subjects | 114 |
| Exam candidates | 600 |
| Exam marks | 2318 |

Every historical exam has its own independent parent. Existing exam IDs are unchanged. Production migration status is up to date. Browser fixtures remain in the test branch.

## Repeatable commands

- npm run test:erp
- npm run typecheck
- npm run build
- npm run test:erp:browser (requires DATABASE_URL and DATABASE_URL_UNPOOLED set to the isolated test branch and the test server on port 3110)
- node --import tsx scripts/verify-erp-migration.ts <backup-file>

See [ERP structure](erp-structure.md) for feature ownership, workflows and migration design.
## 2026-09-28 entry workflow update

Compared Jamia Manager's attendance entry and examination AddMark screens with Dihliz's domain model. Reused the student-by-subject and student-by-date interaction patterns while retaining Dihliz authentication, staff scopes, revision checks and historical rosters.

- Shared dialogs now use content height with a viewport limit, scrollable content and a 672px desktop width; small screens retain 16px margins. Tailwind scans features as well as app/components.
- Exam creation includes select-all classes, reusable yearly exam names, exam date, mark entry due date and planned publish date. Each year creates independent examination records. Dates must follow exam <= entry due <= publish; the exam date belongs to its academic year. Draft schedules are editable per class with revision checks and audit entries. Dates are planning fields; they do not automatically publish results or close mark entry.
- Mark entry supports student search, subject filtering, pending-student filtering, completion counters, Enter/Up/Down navigation, pass/fail colors and shared client/server score validation. Filters survive refresh. Saving still uses the existing authorized, revision-protected action.
- Attendance selection offers daily, Monday-to-Sunday weekly, or calendar-month entry. Year boundaries and future dates are clipped. Dates retain separate daily registers, preserved rosters and submission states. Open missing registers explicitly; unmarked cells remain incomplete.
- Present/Absent/Off controls use green/red/black and accessible labels. Whole-day Off requires a reason. Period saves report success/failure per day; successful days are retained if another day fails. Submitted days link to the audited correction workflow.

Validation: 13 rule tests, full isolated ERP browser suite, focused entry browser tests, TypeScript and production build passed. Browser coverage includes select-all, weekly save/submit, whole-day Off, monthly date columns, score validation/navigation/search, rejected schedule order, and dialog bounds at 1440px, 768px and 390px. Screenshots are in ignored .local/erp-preview.

Migration 20260928100000_exam_schedule was tested on the isolated Neon branch, then applied to production after backup .local/backups/school-postgresql-2026-09-28T10-20-00-981Z.json. Original fields were reconciled for 200 students, 200 enrollments, 27 exams, 114 exam subjects, 600 candidates, 2318 marks, one attendance register and its 27 entries. Historical schedule fields remain null until an administrator assigns dates; no dates were fabricated.
