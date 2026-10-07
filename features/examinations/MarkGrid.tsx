"use client";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import {
  validateScore,
  type ResultMark,
  type ResultSubject,
} from "@/lib/school-rules";
import { entryResult } from "@/lib/exam-entry";
import { Field, inputClass } from "@/components/dashboard/SchoolUI";
type Candidate = {
  id: string;
  studyStreamCode: string | null;
  marks: ResultMark[];
};
export default function MarkGrid({
  subjects,
  candidates,
  partial,
  children,
}: {
  subjects: (ResultSubject & { name: string })[];
  candidates: Candidate[];
  partial: boolean;
  children: ReactNode;
}) {
  const params = useSearchParams(),
    { pending } = useFormStatus();
  const [query, setQuery] = useState(params.get("student") ?? ""),
    [dirty, setDirty] = useState(false),
    [counts, setCounts] = useState({ total: 0, complete: 0, modified: 0 });
  const ref = useRef<HTMLDivElement>(null),
    baseline = useRef(new Map<string, string>());
  const inputs = () =>
    Array.from(
      ref.current?.querySelectorAll<HTMLInputElement>('input[name^="mark:"]') ??
        [],
    );
  function refresh(changedInput?: HTMLInputElement) {
    const all = inputs();
    const changedCandidate = changedInput?.name.split(":")[1];
    const grouped = new Map<string, HTMLInputElement[]>();
    for (const input of all) {
      const candidateId = input.name.split(":")[1];
      const group = grouped.get(candidateId) ?? [];
      group.push(input);
      grouped.set(candidateId, group);
    }
    let complete = 0;
    const modified = new Set<string>();
    for (const input of all) {
      const raw = input.value.trim().toUpperCase();
      let error = "";
      if (!changedInput || changedInput === input) {
        try {
          if (!["ABSENT", "NA"].includes(raw))
            validateScore(raw, Number(input.dataset.maximum));
        } catch (e) {
          error = (e as Error).message;
        }
        input.setCustomValidity(error);
        input.setAttribute("aria-invalid", String(!!error));
        input.style.backgroundColor = error
          ? "#fee2e2"
          : raw === "ABSENT"
            ? "#fef2f2"
            : raw === "NA"
              ? "#f1f5f9"
              : raw && Number(raw) < Number(input.dataset.pass)
                ? "#fff7ed"
                : raw
                  ? "#ecfdf5"
                  : "";
      }
      if (raw && input.validity.valid) complete++;
      if (input.value !== baseline.current.get(input.name))
        modified.add(input.name.split(":")[1]);
      if (!changedInput || changedInput === input)
        input
          .closest("td")
          ?.querySelector("[data-absent]")
          ?.setAttribute("aria-pressed", String(raw === "ABSENT"));
    }
    const live = candidates.map((candidate) => {
      if (changedCandidate && candidate.id !== changedCandidate) return null;
      const marks = new Map(candidate.marks.map((m) => [m.examSubjectId, m]));
      for (const input of grouped.get(candidate.id) ?? []) {
        const subject = input.name.split(":")[2],
          raw = input.value.trim().toUpperCase();
        if (!raw || !input.validity.valid) marks.delete(subject);
        else
          marks.set(subject, {
            examSubjectId: subject,
            status:
              raw === "ABSENT"
                ? "ABSENT"
                : raw === "NA"
                  ? "NOT_APPLICABLE"
                  : "SCORED",
            score: ["ABSENT", "NA"].includes(raw) ? null : Number(raw),
          });
      }
      return {
        ...entryResult(
          subjects,
          Array.from(marks.values()),
          candidate.studyStreamCode,
        ),
        hasFailed: Array.from(marks.values()).some(
          (m) =>
            m.status === "ABSENT" ||
            (m.status === "SCORED" &&
              (m.score ?? 0) <
                (subjects.find((s) => s.id === m.examSubjectId)?.passMarks ??
                  0)),
        ),
      };
    });
    ref.current
      ?.querySelectorAll<HTMLTableRowElement>("tbody tr[data-candidate]")
      .forEach((row) => {
        if (changedCandidate && row.dataset.candidate !== changedCandidate)
          return;
        const index = candidates.findIndex(
          (c) => c.id === row.dataset.candidate,
        );
        if (index < 0) return;
        const result = live[index];
        if (!result) return;
        const set = (selector: string, value: string) => {
          const cell = row.querySelector(selector);
          if (cell) cell.textContent = value;
        };
        set("[data-live-total]", result.total + " / " + result.maximum);
        const totalCell = row.querySelector("[data-live-total]");
        totalCell?.classList.toggle("text-red-600", result.hasFailed);
        totalCell?.classList.toggle("font-semibold", result.hasFailed);
        set(
          "[data-live-percentage]",
          result.percentage === null ? "—" : result.percentage.toFixed(2),
        );
        row.hidden = !(row.cells[0]?.textContent ?? "")
          .toLowerCase()
          .includes(query.toLowerCase());
      });
    setDirty(modified.size > 0);
    setCounts({ total: all.length, complete, modified: modified.size });
  }
  useEffect(() => {
    for (const input of inputs()) baseline.current.set(input.name, input.value);
    refresh();
    const form = ref.current?.closest("form");
    const saved = () => {
      for (const input of inputs())
        baseline.current.set(input.name, input.value);
      refresh();
    };
    form?.addEventListener("erp:saved", saved);
    return () => form?.removeEventListener("erp:saved", saved);
  }, []);
  useEffect(() => {
    refresh();
    const url = new URL(window.location.href);
    if (query) url.searchParams.set("student", query);
    else url.searchParams.delete("student");
    url.searchParams.delete("subject");
    url.searchParams.delete("pending");
    window.history.replaceState(null, "", url);
  }, [query]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const percentage = counts.total
    ? Math.round((counts.complete / counts.total) * 100)
    : 0;
  return (
    <div
      ref={ref}
      className="space-y-4 pb-24"
      onChange={(e) => {
        if (
          !(e.target instanceof HTMLInputElement) ||
          !e.target.name.startsWith("mark:")
        )
          return;
        const input = e.target,
          raw = input.value.trim().toUpperCase();
        try {
          if (
            !["ABSENT", "NA"].includes(raw) &&
            !(
              /^\d+\.$/.test(raw) &&
              Number(raw) <= Number(input.dataset.maximum)
            )
          )
            validateScore(raw, Number(input.dataset.maximum));
          input.dataset.lastValid = input.value;
        } catch {
          input.value =
            input.dataset.lastValid ?? baseline.current.get(input.name) ?? "";
        }
        refresh(input);
      }}
      onClick={(e) => {
        if (!(e.target instanceof Element)) return;
        const button = e.target.closest("[data-absent]");
        if (!button) return;
        const input = button
          .closest("td")
          ?.querySelector<HTMLInputElement>('input[name^="mark:"]');
        if (!input) return;
        input.value = input.value === "ABSENT" ? "" : "ABSENT";
        input.dataset.lastValid = input.value;
        refresh();
      }}
      onKeyDown={(e) => {
        if (
          !(e.target instanceof HTMLInputElement) ||
          !e.target.name.startsWith("mark:")
        )
          return;
        const source = e.target,
          subject = source.name.split(":")[2];
        if (["Enter", "ArrowUp", "ArrowDown", "Tab"].includes(e.key)) {
          const all = inputs().filter(
            (i) => !i.disabled && !i.closest("tr")?.hidden,
          );
          const available =
            e.key === "Tab"
              ? all
              : all.filter((i) => i.name.endsWith(":" + subject));
          const index = available.indexOf(source),
            next =
              available[
                index +
                  (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)
                    ? -1
                    : 1)
              ];
          if (next) {
            e.preventDefault();
            next.focus();
            next.select();
          } else if (e.key !== "Tab") e.preventDefault();
        }
      }}
    >
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center">
        <div className="w-full flex-1">
          <div className="mb-2 flex justify-between text-xs">
            <span>
              Entry Progress · {counts.complete} / {counts.total}
            </span>
            <strong className="text-blue-600">{percentage}%</strong>
          </div>
          <div
            role="progressbar"
            aria-label="Entry Progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            className="h-2 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: percentage + "%" }}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
          Navigate with{" "}
          {["↑", "↓", "↵", "Tab"].map((key) => (
            <kbd key={key} className="rounded border bg-slate-50 px-1.5 py-1">
              {key}
            </kbd>
          ))}
        </div>
      </div>
      <Field label="Student search">
        <input
          className={inputClass}
          value={query}
          placeholder="Name or permanent ID"
          onChange={(e) => setQuery(e.target.value)}
        />
      </Field>
      <div className="overflow-x-auto rounded-xl border [&_th:first-child]:sticky [&_th:first-child]:left-0 [&_th:first-child]:z-20 [&_th:first-child]:bg-slate-50 [&_td:first-child]:sticky [&_td:first-child]:left-0 [&_td:first-child]:z-10 [&_td:first-child]:min-w-[12rem] [&_td:first-child]:bg-white">
        {children}
      </div>
      <div
        className={
          "fixed bottom-6 left-1/2 z-40 flex w-[95%] max-w-2xl -translate-x-1/2 items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-xl " +
          (dirty ? "border-amber-400" : "border-slate-200")
        }
      >
        <div>
          <strong role="status" className="text-sm">
            {dirty ? "Unsaved changes" : "All saved"}
          </strong>
          <p className="text-xs text-slate-500">
            {counts.modified} student{counts.modified === 1 ? "" : "s"} modified
          </p>
        </div>
        <div className="flex gap-2">
          {dirty && (
            <button
              type="button"
              disabled={pending}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm"
              onClick={() => {
                for (const input of inputs()) {
                  input.value = baseline.current.get(input.name) ?? "";
                  input.dataset.lastValid = input.value;
                }
                refresh();
              }}
            >
              Discard
            </button>
          )}
          <button
            type="submit"
            disabled={pending || !dirty}
            className="rounded-lg bg-[#0b7a4b] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save marks"}
          </button>
        </div>
      </div>
    </div>
  );
}
