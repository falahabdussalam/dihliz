"use client";
import Select from "@/components/dashboard/Select";

import { useState } from "react";
import { Field, inputClass, linkClass } from "@/components/dashboard/SchoolUI";
export default function AttendanceChooser({
  classes,
  year,
  start,
  end,
}: {
  classes: { id: string; displayName: string }[];
  year: string;
  start: string;
  end: string;
}) {
  const [mode, setMode] = useState("daily");
  return (
    <form action="/dashboard/attendance/entry" className="space-y-4">
      <input type="hidden" name="year" value={year} />
      <Field label="Class">
        <Select name="cohort" required className={inputClass}>
          {classes.map((c) => (
            <option value={c.id} key={c.id}>
              {c.displayName}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Entry period">
        <Select
          name="mode"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className={inputClass}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Select>
      </Field>
      <Field
        label={
          mode === "daily"
            ? "Date"
            : mode === "weekly"
              ? "Choose a date in the week (Monday to Sunday)"
              : "Choose a date in the month"
        }
      >
        <input
          name="date"
          type="date"
          min={start}
          max={
            end < new Date().toISOString().slice(0, 10)
              ? end
              : new Date().toISOString().slice(0, 10)
          }
          required
          className={inputClass}
        />
      </Field>
      <p className="text-sm text-slate-500">
        Each date keeps its own roster and submission status. Future dates are
        excluded; blank cells remain unmarked.
      </p>
      <button className={linkClass}>Continue to attendance</button>
    </form>
  );
}
