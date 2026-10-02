"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Field,
  Panel,
  inputClass,
  linkClass,
} from "@/components/dashboard/SchoolUI";
import ClassSelection from "./ClassSelection";
import { createExamination } from "./actions";
export default function CreateExaminationForm({
  year,
  classes,
  previousNames,
  subjects,
}: {
  year: { id: string; name: string; startDate: string; endDate: string };
  classes: { id: string; displayName: string }[];
  previousNames: { title: string }[];
  subjects: {
    id: string;
    cohortId: string;
    name: string;
    maxMarks: number;
    passMarks: number;
    studyStreamCode: string | null;
  }[];
}) {
  const [state, action, pending] = useActionState(createExamination, {});
  const router = useRouter();
  const back = "/dashboard/exams?year=" + encodeURIComponent(year.id);
  useEffect(() => {
    if (state.success) router.replace(back);
  }, [state.success, router, back]);
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="yearId" value={year.id} />
      <fieldset disabled={pending} className="min-w-0 max-w-2xl mx-auto space-y-6">
        <Panel title="Primary details">
          <div className="space-y-5">
            <Field label="Name">
              <input
                name="title"
                list="yearly-exam-names"
                className={inputClass}
                required
                minLength={2}
                maxLength={120}
              />
            </Field>
            <datalist id="yearly-exam-names">
              {previousNames.map((e) => (
                <option key={e.title} value={e.title} />
              ))}
            </datalist>
            <div className="grid gap-5 lg:grid-cols-3">
              <Field label="Exam date">
                <input
                  name="date"
                  type="date"
                  className={inputClass}
                  required
                  min={year.startDate}
                  max={year.endDate}
                />
              </Field>
              <Field label="Mark entry due date">
                <input
                  name="markEntryDueDate"
                  type="date"
                  className={inputClass}
                  required
                  min={year.startDate}
                />
              </Field>
              <Field label="Publish date">
                <input
                  name="publishDate"
                  type="date"
                  className={inputClass}
                  required
                  min={year.startDate}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="visibility"
                value="public"
                defaultChecked
              />
              Public results
            </label>
          </div>
        </Panel>
        <ClassSelection classes={classes} subjects={subjects} />
        {state.error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-[#0b7a4b] px-4 py-2 text-sm font-semibold text-white"
          >
            {pending ? "Creating…" : "Create examination"}
          </button>
          <Link href={back} className={linkClass}>
            Cancel
          </Link>
        </div>
      </fieldset>
    </form>
  );
}
