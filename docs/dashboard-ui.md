# Dashboard UI defaults

DashboardLayout and portal dialogs use the locally hosted Plus Jakarta Sans font.

Use components/dashboard/Select for dashboard selectors; it wraps the Jamia Radix select, preserves native form submission and required validation, and places dropdowns inside native dialogs when needed. Use components/dashboard/Popover for filter, sort, and action menus. Use components/dashboard/Pagination for every paginated directory; it preserves URL filters and provides bounded numbered pages.

## Examinations

Participating classes expose their subjects grouped by study stream, with all configured subjects selected by default. Mark limits are copied into the exam snapshot and validated on the server. Exams may be created without subjects; add subjects before entering marks or finalizing results.

Scheduled (blue) means the exam date is in the future. Ongoing (amber) means the date has arrived and mark entry is open. Locked (orange) means the entry deadline has passed or results have been finalized. School dates use Asia/Kolkata, with the entire due day available for entry.

Public/Private is an explicit independent setting, defaulting to Private. Published (green) requires Public, finalized results, and a publish date that has arrived. Otherwise results are Unpublished (gray). Archived results are hidden. Internal DRAFT/FINAL/LOCKED values retain the existing result approval and snapshot protections.

Results export as CSV. Administrators can export one class examination configuration as JSON and import it as a new private exam in the same academic year. The import validates class/subject ownership, uses the current active student roster, and does not import student marks.

Validation: npm run typecheck; node --import dotenv/config --import tsx --test tests/exam-lifecycle.test.ts tests/school-rules.test.ts. The browser test tests/exam-update-browser.ts requires EXAM_ISOLATED_TEST=1, an isolated DATABASE_URL, and the preview on port 3107 with EXAM_PREVIEW=1.

Exam list loading keeps creation-only subjects and name suggestions out of the page query and response. Creation options load on the dedicated admin-only creation page. List/count requests run concurrently, participating-class counts use database aggregates, and exam links do not prefetch detail workspaces. Header search submits on Enter and preserves filters; sort choices apply directly and reset pagination.

Exam creation uses /dashboard/exams/create with a Primary details section and a Streams section with subjects nested under each selected stream. Exam, due, and publish dates use full date inputs with native calendar pickers; the server validates date order and the exam academic-year range. Public results are checked by default, and publication still requires finalized results and the publish date.

Exam detail tabs sit above the workspace; schedule and count cards belong to Overview. Mark entry uses a Jamia-style progress bar, keyboard navigation, absent toggles, unrestricted list height, and a floating Save/Discard bar. Live totals include applicable pending subjects in the denominator; NA is excluded. Rank uses competition ranking by percentage for complete students only and is hidden for partial subject access. CSV results use the same totals and rank rules.

Exam status uses a single badge: published results take precedence over the entry stage, while Public/Private and pending finalization appear as overview details. Scheduled exams omit Mark entry and Mark analysis. Overview holds provisional summaries; Analysis shows detailed subject marks, and Results shows a rank-sorted summary. Closed unmarked cells say Not marked. Subject settings use cards with master-subject guidance; dashboard dialogs are capped at 80dvh or 44rem.

Results is merged into Analysis; legacy results links resolve to Analysis. Analysis starts with rank and sorts complete ranks first, while Mark entry omits rank. Subject cards have Edit and Remove actions; marked subjects cannot be removed. Closed exam entry is available only to Super Admins, with normal inputs and floating save controls. Corrections retain status, use revision checks, are audited, and cannot clear finalized marks. Scheduled and archived exams remain unavailable for entry.

Assigned class teachers (CLASS_MENTOR) can enter marks for every subject in their assigned class during an ongoing exam, in addition to subject tutors and department heads. Unassigned classes remain inaccessible; closed exams still require Super Admin corrections.

Mark input changes repaint and recalculate only the affected student, without rank work in entry mode. Save validates the complete authorized form but writes only changed cells, preserving unchanged mark timestamps. ActionForm shows success/error toasts through the shared Sonner toaster, alongside inline feedback.
