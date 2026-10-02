export type ExamTiming = {
  date: Date;
  markEntryDueDate: Date | null;
  publishDate: Date | null;
  status: string;
  resultsPublic?: boolean;
  isArchived?: boolean;
};
export function examDay(now = new Date()) {
  return new Date(
    now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) +
      "T00:00:00.000Z",
  );
}
export function examStage(exam: ExamTiming, now = new Date()) {
  const today = examDay(now);
  if (exam.date > today) return "Scheduled";
  if (
    exam.status !== "DRAFT" ||
    (exam.markEntryDueDate && exam.markEntryDueDate < today)
  )
    return "Locked";
  return "Ongoing";
}
export function resultPublished(exam: ExamTiming, now = new Date()) {
  return (
    !exam.isArchived &&
    exam.resultsPublic === true &&
    exam.status !== "DRAFT" &&
    !!exam.publishDate &&
    exam.publishDate <= examDay(now)
  );
}
export const examStageStyles = {
  Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  Ongoing: "bg-amber-50 text-amber-700 border-amber-200",
  Locked: "bg-orange-50 text-orange-700 border-orange-200",
};

export function canEnterExamMarks(
  exam: ExamTiming,
  role: string,
  now = new Date(),
) {
  const stage = examStage(exam, now);
  return (
    !exam.isArchived &&
    stage !== "Scheduled" &&
    (stage === "Ongoing" || role === "SUPER_ADMIN")
  );
}
