import test from "node:test";
import assert from "node:assert/strict";
import {
  attendanceSummary,
  performanceSummary,
  canManageRegister,
} from "../features/operations/rules";
test("attendance distinguishes missing days and excludes Off", () => {
  assert.deepEqual(
    attendanceSummary([
      { status: "PRESENT" },
      { status: "ABSENT" },
      { status: "OFF" },
      { status: null },
    ]),
    { present: 1, absent: 1, off: 1, missing: 1, percentage: 50 },
  );
  assert.equal(attendanceSummary([{ status: "OFF" }]).percentage, null);
  assert.equal(attendanceSummary([]).percentage, null);
});
const definitions = [
  { id: "a", name: "Participation", maximum: 10, version: 1 },
  { id: "b", name: "Respect", maximum: 5, version: 1 },
];
test("evaluation blanks, zero and NA have distinct semantics", () => {
  assert.equal(performanceSummary(definitions, {}).missing, 2);
  assert.equal(
    performanceSummary(definitions, {
      a: { value: 0, na: false },
      b: { value: null, na: true },
    }).percentage,
    0,
  );
  assert.equal(
    performanceSummary(definitions, {
      a: { value: 5, na: false },
      b: { value: 5, na: false },
    }).percentage,
    66.67,
  );
  assert.equal(
    performanceSummary(definitions, {
      a: { value: 5, na: false },
      b: { value: null, na: false },
    }).percentage,
    null,
  );
  assert.throws(() =>
    performanceSummary(definitions, { a: { value: 11, na: false } }),
  );
});
test("evaluation maxima belong to the original snapshot", () => {
  const saved = JSON.parse(JSON.stringify(definitions));
  const edited = definitions.map((c) => ({ ...c, maximum: 5, version: 2 }));
  assert.equal(
    performanceSummary(saved, {
      a: { value: 5, na: false },
      b: { value: null, na: true },
    }).percentage,
    50,
  );
  assert.equal(
    performanceSummary(edited, {
      a: { value: 5, na: false },
      b: { value: null, na: true },
    }).percentage,
    100,
  );
});
test("register write permissions require both role and assigned class", () => {
  for (const role of ["SUBJECT_TUTOR", "DEPARTMENT_HEAD", "HOSTEL_MENTOR"])
    assert.equal(canManageRegister(role, true), false);
  assert.equal(canManageRegister("CLASS_MENTOR", false), false);
  assert.equal(canManageRegister("CLASS_MENTOR", true), true);
  assert.equal(
    canManageRegister("CLASS_MENTOR", true, "HOSTEL_BEHAVIOUR"),
    false,
  );
  assert.equal(
    canManageRegister("HOSTEL_MENTOR", true, "HOSTEL_BEHAVIOUR"),
    true,
  );
  assert.equal(
    canManageRegister("HOSTEL_MENTOR", false, "HOSTEL_BEHAVIOUR"),
    false,
  );
  assert.equal(
    canManageRegister("SUPER_ADMIN", false, "HOSTEL_BEHAVIOUR"),
    true,
  );
});

import { attendanceDates } from "../features/operations/period";
test("attendance periods preserve dates and clip year boundaries and future days", () => {
  assert.deepEqual(
    attendanceDates(
      "weekly",
      "2026-09-02",
      "2026-09-01",
      "2027-03-31",
      "2026-09-03",
    ),
    ["2026-09-01", "2026-09-02", "2026-09-03"],
  );
  assert.equal(
    attendanceDates(
      "monthly",
      "2024-02-01",
      "2024-01-01",
      "2024-12-31",
      "2024-03-01",
    ).length,
    29,
  );
  assert.deepEqual(
    attendanceDates(
      "daily",
      "2026-09-28",
      "2026-06-01",
      "2027-03-31",
      "2026-09-28",
    ),
    ["2026-09-28"],
  );
  assert.throws(() =>
    attendanceDates("monthly", "2026-02-30", "2026-01-01", "2026-12-31"),
  );
  assert.throws(() =>
    attendanceDates(
      "daily",
      "2027-01-01",
      "2026-06-01",
      "2027-03-31",
      "2026-09-28",
    ),
  );
  assert.throws(() =>
    attendanceDates("other", "2026-09-28", "2026-06-01", "2027-03-31"),
  );
});
