# Student database migration preparation

Source: https://docs.google.com/spreadsheets/d/19o76_3kap4ktFF4MoQXbRWh2YTD_xiUAXPgSJOUv_xo/edit
Inspected: 2026-09-07. Snapshot SHA-256: 6d4f220e36b698834ffa1230377178cc401c1ddb3b7248e616c861eeb100a96f.
Scope: source audit, target design, schema migration and database import.

## Migration result

Completed on 2026-09-07 from the reviewed snapshot above. The database was backed up privately before migration. Import batch cmtqyd75s0003z0uvknszx8ui created 200 permanent student profiles, 200 active 2026-2027 enrollments, 198 guardian records and 194 contact records. Two contacts remain marked NEEDS_REVIEW. Reapplying the identical snapshot produces no changes.

## Confirmed decisions

- Generate new permanent student IDs.
- Enroll this snapshot in academic year 2026-2027.
- Group means the student's house/team assignment for that academic year.
- Preserve permanent profiles separately from yearly enrollment, as required by the ERP implementation plan.

## Workbook and live database findings

Eight tabs, 200 non-empty student rows. Every tab has StudentID, Name, ParentName, Mobile, Class and Group; the two Science tabs additionally have Stream. Ignore fully empty trailing rows, not rows with partially missing details.

A read-only live database query confirmed that 2026-2027 is active and all nine expected cohorts exist and are not archived. The current Prisma schema has no student, guardian/contact, enrollment or house models.

| Sheet | Students | Target cohort code |
| --- | ---: | --- |
| Class - 8 | 27 | 8 |
| Class - 9A | 21 | 9-A |
| Class - 9B | 21 | 9-B |
| Class - 10 | 28 | 10 |
| Class - +1 Science | 28 | PLUS1-SCIENCE |
| Class - +1 Commerce | 25 | PLUS1-COMMERCE |
| Class - +2 Science, Computer | 18 | PLUS2-COMPUTER-SCIENCE |
| Class - +2 Science, Biology | 10 | PLUS2-BIOLOGY-SCIENCE |
| Class - +2 Commerce | 22 | PLUS2-COMMERCE |
| Total | 200 | Nine cohorts |

The +1 Science cohort contains 19 CS and nine BIO students. Retain the confirmed combined cohort, with COMPUTER_SCIENCE or BIOLOGY_SCIENCE on each yearly enrollment. Do not collapse these choices into the cohort's general SCIENCE stream. For +2, the selected stream also determines the separate cohort.

House names normalize by trimming whitespace and matching case:
- Andalus Falcons: 57
- Cordobic Titans: 57
- Granadic Guardians: 57
- Unassigned: 29

## Field mapping and proposed tables

These models were implemented in migration 20260907080000_student_foundation.

| Source | Target | Import handling |
| --- | --- | --- |
| StudentID | Student.studentNumber | Generate a permanent unique number. Internal Student.id remains a generated CUID. |
| Name | Student.fullName | Required; trim/collapse whitespace, preserve spelling and capitalization. |
| ParentName | StudentGuardian.fullName | Nullable when missing. Relationship stays UNSPECIFIED unless explicitly supplied; do not assume father. |
| Mobile | StudentContact.rawValue / normalizedPhone / label | One record per phone token, retaining original source value and labels. A contact belongs to the student, with optional guardian linkage. |
| Class and source tab | StudentEnrollment.cohortId | Resolve against the selected academic year's existing cohorts using mapping.json. |
| Stream | StudentEnrollment.studyStreamId | Preserve +1 CS/BIO; verify +2 selected stream matches its cohort. |
| Group | StudentEnrollment.houseId | Nullable yearly assignment referencing a House master. |
| Confirmed year | StudentEnrollment.academicYearId | 2026-2027 explicitly; never silently select another active year on rerun. |
| Snapshot/sheet/row | StudentImportBatch / StudentImportRow | Durable provenance, per-row results and generated student ID mapping. |

Suggested minimum models:
- Student: id, studentNumber (unique), fullName, optional dateOfBirth and photoUrl, isArchived, timestamps.
- StudentGuardian: id, studentId, optional fullName, relationship. Do not merge people across students using a name or phone alone.
- StudentContact: id, studentId, optional guardianId, rawValue, optional normalizedPhone, optional label, verificationStatus. Unknown ownership stays unlinked. Do not mark a number as WhatsApp-capable or primary without evidence.
- House: id, code (unique), name, isArchived.
- StudentEnrollment: id, studentId, academicYearId, cohortId, optional studyStreamId, optional houseId, optional rollNumber, status, timestamps. Unique studentId + academicYearId for the initial yearly model.
- StudentImportBatch: source ID, snapshot checksum, target year, mapping version, status, timestamps and operator.
- StudentImportRow: batchId, sheet, rowNumber, studentId, result and source fingerprint. Unique batch + sheet + row.

Enforce cohort/year consistency with a composite relation or equivalent database constraint. Index enrollment by year/cohort/status and year/house. Restrict deletion of referenced students/cohorts/houses and archive records. If mid-year class or house transfer history is needed, add effective-dated assignment history before implementing those workflows; yearly promotion must always create a new enrollment.

DOB, address, gender, photo, admission date and roll number are not present. Keep them nullable or defer them. Do not invent dates or turn spreadsheet row numbers into roll numbers. No student login credentials are implied by this import.

## Source issues and resolution policy

| Finding | Exact source references | Proposed handling |
| --- | --- | --- |
| All 200 StudentID values blank | Column A on every tab | Generate IDs using confirmed policy. |
| 27 mobile numbers missing | Class - 8!D2:D28 | Import profiles with contact missing; no synthetic numbers. |
| Two parent names missing | Class - 8!C19, C28 | Preserve null; do not infer a parent from another student. |
| Five class values missing | Class - 8!E24:E28 | Use explicit Class - 8 sheet mapping and log each fallback. |
| 29 house assignments missing | Class - 8!F2:F28; Class - 9B!F21:F22 | Keep unassigned until supplied; do not balance houses automatically. |
| 19 rows contain multiple phone contacts | Class - 9B, rows 2-8, 10-17, 19-22 | Split line breaks into separate contacts, retaining parent labels and order. |
| One phone is a formula | Class - 9B!D18 | Review original and cached value; never evaluate formulas as executable code. Require a reviewed value override or source correction before using this contact. |
| Same normalized student name occurs twice | Class - 10!B28; Class - +2 Commerce!B16 | Different parent names; keep separate profiles. Flag for review, never merge on name alone. |

No missing student names or duplicate normalized name+parent pairs were found. These checks cannot prove real-world identity uniqueness.

The audit flags 29 phone rows for format review; this includes normal international formats, multi-contact rows and spacing, not 29 invalid phone numbers. Observed prefixes include Indian and overseas contacts. Normalize with a country-aware phone library; retain explicit country prefixes, handle 00 international prefixes, and do not prepend +91 to every value. Review ambiguous/invalid lengths individually. Store phones as strings and preserve the raw value, especially where spreadsheet numeric cells may have lost a leading zero. Phone sharing between relatives is allowed; it is not a student deduplication key.

## Permanent IDs and safe reruns

Recommended visible format: DWS-000001 onward, allocated transactionally from a database sequence/counter with a unique constraint. The format is a proposal; the confirmed requirement is permanent generated IDs. Never use COUNT(*) + 1, a student's class, their year, name or phone as identity.

1. Freeze and checksum a fresh reviewed source snapshot.
2. Create a durable manifest containing source row -> generated student ID.
3. Run a dry run that outputs create/update/skip/conflict counts and field-level issues before writes.
4. For the first snapshot, commit student, guardian/contact, enrollment and import-row linkage together per student in bounded transactions. Mark batches resumable and reconcile after all rows finish.
5. An identical snapshot rerun must reuse its batch/row mappings and make no duplicate students.
6. A changed or reordered sheet must not match solely on row number. Reconcile using generated IDs from the durable manifest or a reviewed ID-bearing source; require manual mapping for unmatched rows.
7. Log the import operation and summary through AuditLog. Retain detailed manifests outside public assets and source control.

Do not write IDs back to the Google Sheet without a separate instruction to edit it.

## Execution order and acceptance checks

1. Review contact exceptions and approve explicit source overrides; missing optional fields may remain null.
2. Implement and validate the proposed Prisma models and migration.
3. Back up the target database, apply the schema migration, and seed the three House records without resetting academic setup or administrator accounts.
4. Build the importer against the checked-in mapping; default to dry-run and require explicit apply mode.
5. Confirm 200 planned profiles, 200 enrollments, nine cohort mappings, house counts 57/57/57/29, and the 19/9 +1 Science split.
6. Apply the reviewed snapshot and reconcile actual counts, contact rows, foreign keys and source-to-ID mappings.
7. Verify rerun idempotency, rollback on a failed row, formula handling, ambiguous contact handling and authorization.
8. Build the student directory/edit flow against permanent Student + current-year StudentEnrollment and the existing scoped staff access rules.

Preparation files:
- scripts/student-import/mapping.json: confirmed year, ID policy, cohort/stream and house aliases.
- scripts/student-import/audit.py: read-only XLSX structural audit, using openpyxl. Accepts a local workbook path and prints aggregates and cell references without raw names or phones. It does not modify the workbook or connect to the database.

The workbook snapshot has been imported and reconciled. Future changed snapshots are refused when students already exist unless a reviewed identity-mapping workflow is added.
