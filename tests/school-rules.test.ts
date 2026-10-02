import test from "node:test";
import assert from "node:assert/strict";
import { applies, examResult, validateScore, csvCell } from "../lib/school-rules";
import { canReadExamSubject, canEditExamSubject } from "../lib/school-access";
const subjects = [{ id: "one", maxMarks: 100, passMarks: 40, studyStreamCode: null }, { id: "two", maxMarks: 50, passMarks: 20, studyStreamCode: "BIOLOGY_SCIENCE" }];
test("weighted total uses maximum marks, not a mean of subject percentages", () => {
  const r = examResult(subjects, [{ examSubjectId: "one", status: "SCORED", score: 80 }, { examSubjectId: "two", status: "SCORED", score: 25 }], "BIOLOGY_SCIENCE");
  assert.equal(r.percentage, 70); assert.equal(r.grade, "B+"); assert.equal(r.total, 105);
});
test("blank marks remain incomplete; zero is a real score", () => {
  assert.equal(examResult(subjects, [], "COMPUTER_SCIENCE").missing, 1);
  const r = examResult(subjects, [{ examSubjectId: "one", status: "SCORED", score: 0 }], "COMPUTER_SCIENCE");
  assert.equal(r.missing, 0); assert.equal(r.percentage, 0); assert.equal(r.grade, "F");
});
test("absence is zero and fails even with a zero pass threshold", () => {
  const r = examResult([{ ...subjects[0], passMarks: 0 }], [{ examSubjectId: "one", status: "ABSENT", score: null }], null);
  assert.equal(r.maximum, 100); assert.equal(r.grade, "F");
});
test("NA and nonmatching stream subjects do not enter the denominator", () => {
  assert.equal(applies(subjects[1], "COMPUTER_SCIENCE"), false);
  const r = examResult(subjects, [{ examSubjectId: "one", status: "NOT_APPLICABLE", score: null }], "COMPUTER_SCIENCE");
  assert.equal(r.maximum, 0); assert.equal(r.grade, "N/A"); assert.equal(r.percentage, null);
});
test("individual subject failure overrides high aggregate grade", () => {
  assert.equal(examResult(subjects, [{ examSubjectId: "one", status: "SCORED", score: 100 }, { examSubjectId: "two", status: "SCORED", score: 19 }], "BIOLOGY_SCIENCE").grade, "F");
});
test("score parsing rejects negatives, overflow, exponents, NaN and excess precision", () => {
  for (const value of ["-1", "101", "NaN", "1e2", "0.123", "1/2"]) assert.throws(() => validateScore(value, 100));
  assert.equal(validateScore("0", 100), 0); assert.equal(validateScore("99.99", 100), 99.99); assert.equal(validateScore("", 100), null);
});
test("CSV quotes fields and neutralizes formulas including leading spaces", () => {
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell(" =HYPERLINK()"), '"\' =HYPERLINK()"');
});
test("exam subject access is fail-closed for staff and department scopes", () => {
  const scope = { departmentIds: ["science"], explicit: ["cohort"] };
  const subject = { tutorId: "tutor", subject: { departmentId: "science" } };
  const base = { email: "test@example.invalid", fullName: "Test", id: "tutor" };
  assert.equal(canEditExamSubject({ ...base, role: "SUBJECT_TUTOR" }, scope, "cohort", subject), true);
  assert.equal(canEditExamSubject({ ...base, id: "other", role: "SUBJECT_TUTOR" }, scope, "cohort", subject), false);
  assert.equal(canReadExamSubject({ ...base, role: "CLASS_MENTOR" }, scope, "cohort", subject), true);
  assert.equal(canEditExamSubject({ ...base, role: "CLASS_MENTOR" }, scope, "cohort", subject), true);
  assert.equal(canEditExamSubject({ ...base, role: "CLASS_MENTOR" }, scope, "other-cohort", subject), false);
  assert.equal(canReadExamSubject({ ...base, role: "HOSTEL_MENTOR" }, scope, "cohort", subject), false);
  assert.equal(canReadExamSubject({ ...base, role: "DEPARTMENT_HEAD" }, { ...scope, departmentIds: [] }, "cohort", subject), false);
});
