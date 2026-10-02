import test from "node:test";
import assert from "node:assert/strict";
import { canEnterExamMarks } from "../lib/exam-lifecycle";
test("current class subject tutor can view and edit despite empty or stale exam marker", async () => {
  const tutor = {
    id: "current-tutor",
    email: "test@example.invalid",
    fullName: "Tutor",
    role: "SUBJECT_TUTOR" as const,
  };
  const fixture = {
    id: "exam",
    cohortId: "cohort",
    date: new Date("2026-10-01"),
    markEntryDueDate: new Date("2026-10-03"),
    publishDate: new Date("2026-10-04"),
    status: "DRAFT",
    cohort: { academicYearId: "year" },
    subjects: [
      {
        id: "subject",
        markingTutorId: null as string | null,
        cohortSubject: {
          tutorId: tutor.id,
          subject: { departmentId: "department" },
        },
      },
    ],
    candidates: [],
  };
  const globals = globalThis as unknown as { prisma: unknown };
  const previous = globals.prisma;
  globals.prisma = {
    exam: { findUnique: async () => fixture },
    staffAssignment: {
      findMany: async () => [{ cohortId: "cohort", departmentId: null }],
    },
    academicCohort: { findMany: async () => [{ id: "cohort" }] },
  };
  const { examWorkspace } = await import("../features/examinations/queries");
  try {
    for (const legacyMarker of [null, "old-tutor"]) {
      fixture.subjects[0].markingTutorId = legacyMarker;
      const workspace = await examWorkspace(tutor, "exam");
      assert.ok(workspace);
      assert.equal(workspace.subjects[0].canEdit, true);
      assert.equal(
        canEnterExamMarks(
          workspace.exam,
          tutor.role,
          new Date("2026-10-02T12:00:00Z"),
        ),
        true,
      );
    }
    const classTeacher = await examWorkspace(
      { ...tutor, id: "class-teacher", role: "CLASS_MENTOR" },
      "exam",
    );
    assert.ok(classTeacher);
    assert.equal(classTeacher.subjects[0].canEdit, true);
    assert.equal(
      await examWorkspace({ ...tutor, id: "old-tutor" }, "exam"),
      null,
    );
  } finally {
    globals.prisma = previous;
  }
});
