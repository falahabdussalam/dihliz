import test from "node:test";
import assert from "node:assert/strict";
import { entryResult, resultRanks } from "../lib/exam-entry";
const subjects = [
  { id: "a", maxMarks: 100, passMarks: 40, studyStreamCode: null },
  { id: "b", maxMarks: 50, passMarks: 20, studyStreamCode: null },
  { id: "c", maxMarks: 100, passMarks: 40, studyStreamCode: "SCIENCE" },
];
test("live totals include missing marks in the denominator and exclude other streams", () => {
  const r = entryResult(
    subjects,
    [{ examSubjectId: "a", status: "SCORED", score: 75 }],
    null,
  );
  assert.equal(r.total, 75);
  assert.equal(r.maximum, 150);
  assert.equal(r.percentage, 50);
  assert.equal(r.missing, 1);
});
test("absent contributes zero and NA is excluded", () => {
  const r = entryResult(
    subjects,
    [
      { examSubjectId: "a", status: "ABSENT", score: null },
      { examSubjectId: "b", status: "NOT_APPLICABLE", score: null },
    ],
    null,
  );
  assert.equal(r.total, 0);
  assert.equal(r.maximum, 100);
  assert.equal(r.missing, 0);
});
test("competition ranks share ties and skip incomplete or inapplicable students", () => {
  assert.deepEqual(
    resultRanks([
      { missing: 0, percentage: 90 },
      { missing: 0, percentage: 90 },
      { missing: 0, percentage: 80 },
      { missing: 1, percentage: 95 },
      { missing: 0, percentage: null },
    ]),
    [1, 1, 3, null, null],
  );
});
