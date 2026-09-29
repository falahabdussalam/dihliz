# Dihliz School ERP Implementation Plan

## Confirmed foundation

- ERP route: /dashboard; legacy /cpanel is transitional and remains protected until its content modules are migrated.
- Roles: Super Admin, Department Head, Class Mentor, Hostel Mentor, and Subject Tutor.
- Access is scoped by academic year and, where applicable, cohort and department. Subject-level scope will be added with the Subjects module.
- Confirmed cohorts:
  - 8
  - 9A
  - 9B
  - 10
  - +1 Science
  - +1 Commerce
  - +2 Computer Science
  - +2 Biology Science
  - +2 Commerce
- Permanent records and yearly operational data remain separate so historical academic years are never overwritten.

## Delivery sequence

1. **Foundation - implemented**
   - Prisma/MySQL migration, database sessions, role models, staff-assignment model, audit log, dashboard shell, academic-year management, cohort management, and seed data.
2. **Staff access**
   - Staff CRUD, account activation, password reset, and academic-year/cohort/department assignments.
3. **Subjects and students**
   - Subject master and yearly cohort assignments with default maximum marks.
   - Permanent student profile, photo, guardian contacts, yearly enrollment, roll number, import/export, and promotion.
4. **Daily attendance**
   - Date/cohort register, Present by default, Absent marking, working-day calendar, correction audit, monthly totals, and future WhatsApp event queue.
5. **Exams and marks**
   - Cohort exam setup, selected subjects, per-exam maximum marks, spreadsheet entry, Absent/Not Applicable, totals, grades, draft/final/locked workflow.
6. **Assessments**
   - Classroom Behaviour, Hostel Behaviour, Study and Discipline, configurable criteria, monthly grids, remarks, weights, and normalized scores.
7. **Performance, Islamic department, and achievements**
   - Activity Performance; Competitive Performance with rank; Islamic exams and optional Hifz tracking; student achievements and evidence.
8. **360-degree reports**
   - Stream-specific configurable templates, all academic-year months, completion checks, calculated scores, strengths/improvements, approval snapshots, branded PDFs, and secure QR links.
9. **Legacy content migration**
   - Move admissions, gallery, news/events, services, users, and uploads from PHP into Prisma/MySQL, verify counts/files, then archive PHP read-only.

## Shared implementation rules

- Every write is server-authorized and validated.
- Bulk entry uses transactions and unique database constraints.
- Academic records are archived rather than destructively deleted.
- Operational pages are optimized for tablet attendance and desktop mark entry.
- Reports read approved/versioned data and never silently change after publication.
- Each phase requires type checks, migration validation, calculation tests, authorization tests, and a production build.
