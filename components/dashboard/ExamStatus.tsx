import {
  examStage,
  examStageStyles,
  resultPublished,
  type ExamTiming,
} from "@/lib/exam-lifecycle";
export default function ExamStatus({ exam }: { exam: ExamTiming }) {
  const stage = examStage(exam),
    published = resultPublished(exam);
  const descriptions = {
    Scheduled: "Exam scheduled for a future date",
    Ongoing: "Exam started; mark entry is open",
    Locked: "Mark entry window closed",
  };
  return (
    <span
      title={
        published ? "Finalized public results are visible" : descriptions[stage]
      }
      className={
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold " +
        (published
          ? "border-green-200 bg-green-50 text-green-700"
          : examStageStyles[stage])
      }
    >
      {published ? "Published" : stage}
    </span>
  );
}
