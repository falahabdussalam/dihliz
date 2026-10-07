import {
  applies,
  examResult,
  type ResultSubject,
  type ResultMark,
} from "./school-rules";
export function entryResult(
  subjects: ResultSubject[],
  marks: ResultMark[],
  stream: string | null,
) {
  const missing = subjects.filter(
    (s) => applies(s, stream) && !marks.some((m) => m.examSubjectId === s.id),
  );
  const result = examResult(
    subjects,
    [
      ...marks,
      ...missing.map((s) => ({
        examSubjectId: s.id,
        status: "SCORED",
        score: 0,
      })),
    ],
    stream,
  );
  return { ...result, missing: missing.length };
}
export function resultRanks(
  results: { missing: number; percentage: number | null }[],
) {
  const complete = results.filter((r) => !r.missing && r.percentage !== null);
  return results.map((r) =>
    r.missing || r.percentage === null
      ? null
      : 1 +
        complete.filter((other) => other.percentage! > r.percentage!).length,
  );
}
