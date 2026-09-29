"use client";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "OFF" | null;
export default function AttendanceStatusControl({
  value,
  onChange,
  label,
  disabled = false,
}: {
  value: AttendanceStatus;
  onChange: (v: AttendanceStatus) => void;
  label: string;
  disabled?: boolean;
}) {
  const options = [
    ["PRESENT", "Present", "bg-emerald-600 border-emerald-600 text-white"],
    ["ABSENT", "Absent", "bg-red-600 border-red-600 text-white"],
    ["OFF", "Off", "bg-black border-black text-white"],
  ] as const;
  return (
    <div role="group" aria-label={label} className="flex items-center gap-1">
      {options.map(([status, title, color]) => (
        <button
          key={status}
          type="button"
          role="checkbox"
          aria-checked={value === status}
          aria-label={label + " " + title}
          title={title + " (click again to clear)"}
          disabled={disabled}
          onClick={() => onChange(value === status ? null : status)}
          className={
            "flex h-8 w-8 shrink-0 items-center justify-center rounded border text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 " +
            (value === status
              ? color
              : "border-slate-300 bg-white text-slate-500")
          }
        >
          {value === status ? "✓" : title[0]}
        </button>
      ))}
    </div>
  );
}
