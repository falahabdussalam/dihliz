export type ResultSubject = { id: string; maxMarks: number; passMarks: number; studyStreamCode: string | null };
export type ResultMark = { examSubjectId: string; status: string; score: number | null };
export function applies(subject: ResultSubject, stream: string | null) {
  return !subject.studyStreamCode || subject.studyStreamCode === stream;
}
export function examResult(subjects: ResultSubject[], marks: ResultMark[], stream: string | null) {
  let total = 0, maximum = 0, missing = 0, failed = false;
  const bySubject = new Map(marks.map(mark => [mark.examSubjectId, mark]));
  for (const subject of subjects.filter(subject => applies(subject, stream))) {
    const mark = bySubject.get(subject.id);
    if (!mark) { missing++; continue; }
    if (mark.status === "NOT_APPLICABLE") continue;
    maximum += subject.maxMarks;
    const score = mark.status === "ABSENT" ? 0 : (mark.score ?? 0);
    total += score;
    if (mark.status === "ABSENT" || score < subject.passMarks) failed = true;
  }
  const percentage = maximum ? Math.round(total / maximum * 10000) / 100 : null;
  const grade = missing ? "Incomplete" : percentage === null ? "N/A" : failed ? "F" :
    percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B+" :
    percentage >= 60 ? "B" : percentage >= 50 ? "C" : percentage >= 40 ? "D" : "E";
  return { total, maximum, missing, percentage, grade, passed: !missing && maximum > 0 && !failed };
}
export function validateScore(raw: string, maximum: number) {
  if (raw === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) throw new Error("Enter a non-negative mark with up to two decimal places.");
  const score = Number(raw);
  if (!Number.isFinite(score) || score > maximum) throw new Error("Marks must be between 0 and " + maximum + ".");
  return score;
}
export function csvCell(value: unknown) {
  const raw = String(value ?? "");
  const safe = /^[\s]*[=+@-]/.test(raw) ? "'" + raw : raw;
  return '"' + safe.replace(/"/g, '""') + '"';
}
