import test from "node:test";
import assert from "node:assert/strict";
import { examStage, resultPublished } from "../lib/exam-lifecycle";
import { examConfiguration } from "../lib/exam-transfer";
const exam = {
  date: new Date("2026-09-30"),
  markEntryDueDate: new Date("2026-10-02"),
  publishDate: new Date("2026-10-03"),
  status: "DRAFT",
  resultsPublic: true,
};
test("exam dates use the school timezone and entry closes after the due day", () => {
  assert.equal(examStage(exam, new Date("2026-09-29T18:29:00Z")), "Scheduled");
  assert.equal(examStage(exam, new Date("2026-09-29T18:30:00Z")), "Ongoing");
  assert.equal(examStage(exam, new Date("2026-10-02T18:29:00Z")), "Ongoing");
  assert.equal(examStage(exam, new Date("2026-10-02T18:30:00Z")), "Locked");
});
test("public results require finalization and publish date; private results stay hidden", () => {
  const now = new Date("2026-10-03T12:00:00Z");
  assert.equal(resultPublished(exam, now), false);
  assert.equal(resultPublished({ ...exam, status: "FINAL" }, now), true);
  assert.equal(
    resultPublished({ ...exam, status: "FINAL", resultsPublic: false }, now),
    false,
  );
  assert.equal(
    resultPublished({ ...exam, status: "FINAL", publishDate: null }, now),
    false,
  );
  assert.equal(
    resultPublished({ ...exam, status: "FINAL" }, new Date("2026-10-01")),
    false,
  );
});
test("configuration accepts an exam without subjects and rejects invalid mark limits", () => {
  const config = {
    version: 1,
    title: "Term examination",
    date: "2026-09-30",
    markEntryDueDate: "2026-10-02",
    publishDate: "2026-10-03",
    cohorts: [{ cohortId: "c123456789012345678901234", subjects: [] }],
  };
  assert.equal(examConfiguration.safeParse(config).success, true);
  assert.equal(
    examConfiguration.safeParse({
      ...config,
      cohorts: [
        {
          ...config.cohorts[0],
          subjects: [
            { id: "c123456789012345678901235", maxMarks: 50, passMarks: 51 },
          ],
        },
      ],
    }).success,
    false,
  );
});

test("closed mark entry permits only Super Admin corrections", async () => {
  const { canEnterExamMarks } = await import("../lib/exam-lifecycle");
  const now = new Date("2026-10-05T12:00:00Z");
  for (const status of ["DRAFT", "FINAL", "LOCKED"]) {
    const closed = { ...exam, status };
    assert.equal(canEnterExamMarks(closed, "SUPER_ADMIN", now), true);
    for (const role of ["SUBJECT_TUTOR", "DEPARTMENT_HEAD", "CLASS_MENTOR"])
      assert.equal(canEnterExamMarks(closed, role, now), false);
  }
  assert.equal(
    canEnterExamMarks({ ...exam, isArchived: true }, "SUPER_ADMIN", now),
    false,
  );
  assert.equal(
    canEnterExamMarks(exam, "SUPER_ADMIN", new Date("2026-09-28")),
    false,
  );
});
