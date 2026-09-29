"use client";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { validateScore } from "@/lib/school-rules";
import { useSearchParams } from "next/navigation";
import { Field, inputClass } from "@/components/dashboard/SchoolUI";
export default function MarkGrid({
  subjects,
  children,
}: {
  subjects: { id: string; name: string }[];
  children: ReactNode;
}) {
  const params = useSearchParams();
  const [selected, setSelected] = useState(params.get("subject") ?? ""),
    [query, setQuery] = useState(params.get("student") ?? ""),
    [onlyPending, setOnlyPending] = useState(params.get("pending") === "1"),
    [dirty, setDirty] = useState(false),
    [counts, setCounts] = useState({ pending: 0, total: 0, complete: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const refresh = () => {
    const inputs = Array.from(
      ref.current?.querySelectorAll<HTMLInputElement>('input[name^="mark:"]') ??
        [],
    );
    for (const input of inputs) {
      const raw = input.value.trim().toUpperCase(),
        max = Number(input.dataset.maximum);
      let error = "";
      if (!["ABSENT", "NA"].includes(raw))
        try {
          validateScore(raw, max);
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
    let complete = 0;
    ref.current
      ?.querySelectorAll<HTMLTableRowElement>("tbody tr")
      .forEach((row) => {
        const cells = Array.from(
          row.querySelectorAll<HTMLInputElement>('input[name^="mark:"]'),
        );
        const pending = cells.filter((i) => !i.value.trim()).length;
        if (cells.length && !pending) complete++;
        row.hidden =
          !(row.cells[0]?.textContent ?? "")
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          (onlyPending && !pending);
        row.dataset.completion = pending ? "pending" : "complete";
      });
    ref.current
      ?.querySelectorAll<HTMLElement>("[data-exam-subject]")
      .forEach((cell) => {
        cell.hidden = !!selected && cell.dataset.examSubject !== selected;
      });
    setCounts({
      pending: inputs.filter((i) => !i.value.trim()).length,
      total: inputs.length,
      complete,
    });
  };
  useEffect(() => {
    refresh();
    const url = new URL(window.location.href);
    for (const [key, value] of [
      ["subject", selected],
      ["student", query],
      ["pending", onlyPending ? "1" : ""],
    ]) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(null, "", url);
  }, [selected, query, onlyPending]);
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
  useEffect(() => {
    const form = ref.current?.closest("form");
    const saved = () => setDirty(false);
    form?.addEventListener("erp:saved", saved);
    return () => form?.removeEventListener("erp:saved", saved);
  }, []);
  return (
    <div
      ref={ref}
      className="space-y-4"
      onChangeCapture={(e) => {
        if (
          !(e.target instanceof HTMLInputElement) ||
          !e.target.name.startsWith("mark:")
        )
          return;
        setDirty(true);
        refresh();
      }}
      onKeyDown={(e) => {
        if (
          !(e.target instanceof HTMLInputElement) ||
          !e.target.name.startsWith("mark:") ||
          !["Enter", "ArrowUp", "ArrowDown"].includes(e.key)
        )
          return;
        const source = e.target,
          subject = source.name.split(":").at(-1);
        const inputs = Array.from(
          ref.current?.querySelectorAll<HTMLInputElement>(
            'input[name^="mark:"]',
          ) ?? [],
        ).filter(
          (i) =>
            i.name.endsWith(":" + subject) &&
            !i.closest("tr")?.hidden &&
            !i.closest("td")?.hidden,
        );
        const index = inputs.indexOf(source),
          next = inputs[index + (e.key === "ArrowUp" ? -1 : 1)];
        e.preventDefault();
        next?.focus();
        next?.select();
      }}
    >
      <div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-500">Completed cells</p>
          <strong>
            {counts.total - counts.pending} / {counts.total}
          </strong>
        </div>
        <div>
          <p className="text-xs text-slate-500">Pending cells</p>
          <strong>{counts.pending}</strong>
        </div>
        <div>
          <p className="text-xs text-slate-500">Entry status</p>
          <strong role="status">
            {dirty ? "Unsaved changes" : "Saved marks"}
          </strong>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Student search">
          <input
            aria-label="Search marks students"
            className={inputClass}
            value={query}
            placeholder="Name or permanent ID"
            onChange={(e) => setQuery(e.target.value)}
          />
        </Field>
        <Field label="Visible subject">
          <select
            className={inputClass}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 py-3 text-sm">
          <input
            type="checkbox"
            checked={onlyPending}
            onChange={(e) => setOnlyPending(e.target.checked)}
          />{" "}
          Pending students only
        </label>
      </div>
      <p className="text-xs text-slate-500">
        Enter / ↑ / ↓ move within a subject; Tab moves across cells. Orange
        scores are below the pass mark. Totals update after Save marks.
      </p>
      <div className="max-h-[65dvh] overflow-auto rounded-xl border [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-20 [&_thead]:bg-slate-50 [&_th:first-child]:sticky [&_th:first-child]:left-0 [&_th:first-child]:z-30 [&_th:first-child]:bg-slate-50 [&_td:first-child]:sticky [&_td:first-child]:left-0 [&_td:first-child]:z-10 [&_td:first-child]:min-w-[12rem] [&_td:first-child]:bg-white">
        {children}
      </div>
    </div>
  );
}
