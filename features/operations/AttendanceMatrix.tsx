"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog } from "@/components/dashboard/Dialog";
import { inputClass, linkClass } from "@/components/dashboard/SchoolUI";
import { saveRegister } from "./actions";
import StatusControl, { type AttendanceStatus } from "./AttendanceStatus";
type Entry = {
  id: string;
  enrollmentId: string;
  fullName: string;
  studentNumber: string;
  status: AttendanceStatus;
  reason: string | null;
};
type Register = {
  id: string;
  date: string;
  revision: number;
  status: string;
  entries: Entry[];
};
export default function AttendanceMatrix({
  dates,
  registers,
}: {
  dates: string[];
  registers: Register[];
}) {
  const [rows, setRows] = useState(registers),
    [dirty, setDirty] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [search, setSearch] = useState("");
  const [off, setOff] = useState<{
      registerId: string;
      entryId?: string;
    } | null>(null),
    [reason, setReason] = useState("");
  useEffect(() => {
    if (!busy && !dirty.length) setRows(registers);
  }, [registers, busy, dirty.length]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.length) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const update = (
    registerId: string,
    status: AttendanceStatus,
    entryId?: string,
    offReason?: string,
  ) => {
    setRows((current) =>
      current.map((r) =>
        r.id !== registerId
          ? r
          : {
              ...r,
              entries: r.entries.map((e) =>
                entryId && entryId !== e.id
                  ? e
                  : {
                      ...e,
                      status,
                      reason: status === "OFF" ? (offReason ?? e.reason) : null,
                    },
              ),
            },
      ),
    );
    setDirty((current) =>
      current.includes(registerId) ? current : [...current, registerId],
    );
    setMessage("");
  };
  const save = async (ids: string[], submit = false) => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    const completed: string[] = [],
      errors: string[] = [];
    let next = rows;
    for (const registerId of ids) {
      const r = next.find((r) => r.id === registerId)!;
      const data = new FormData();
      data.set("kind", "attendance");
      data.set("registerId", r.id);
      data.set("revision", String(r.revision));
      data.set("intent", submit ? "submit" : "save");
      r.entries.forEach((e) => {
        data.append("entryIds", e.id);
        data.set("status:" + e.id, e.status ?? "");
        data.set("reason:" + e.id, e.reason ?? "");
      });
      try {
        const result = await saveRegister({}, data);
        if (result.error) {
          errors.push(r.date + ": " + result.error);
          continue;
        }
        completed.push(r.id);
        next = next.map((v) =>
          v.id === r.id
            ? {
                ...v,
                revision: v.revision + 1,
                status: submit ? "SUBMITTED" : v.status,
              }
            : v,
        );
      } catch {
        errors.push(
          r.date +
            ": connection failed; reload before retrying if the save reached the server.",
        );
      }
    }
    setRows(next);
    setDirty((current) => current.filter((id) => !completed.includes(id)));
    setBusy(false);
    setMessage(
      completed.length +
        " day(s) saved." +
        (errors.length ? " Unsaved days: " + errors.join(" ") : ""),
    );
  };
  const students = Array.from(
    new Map(
      rows.flatMap((r) => r.entries.map((e) => [e.enrollmentId, e] as const)),
    ).values(),
  ).sort((a, b) => a.fullName.localeCompare(b.fullName));
  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          className={inputClass + " max-w-xs"}
          aria-label="Search attendance students"
          placeholder="Search student or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="text-sm text-slate-600">
          <span className="text-emerald-700">P Present</span> ·{" "}
          <span className="text-red-700">A Absent</span> ·{" "}
          <span className="text-black">O Off</span> · Empty = unmarked
        </p>
      </div>
      <p className="text-sm text-slate-500">
        Select one status per student and day. Click the selected box to clear
        it. Off is excluded from attendance percentages. Each day saves
        independently.
      </p>
      <div className="max-h-[65dvh] overflow-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-20 bg-slate-50">
            <tr>
              <th className="sticky left-0 z-30 min-w-[12rem] bg-slate-50 p-3">
                Student
              </th>
              {dates.map((date) => {
                const r = rows.find((r) => r.date === date);
                return (
                  <th key={date} className="min-w-[10rem] border-l p-3">
                    <span>{date.slice(5)}</span>
                    <span className="block text-xs font-normal text-slate-500">
                      {r?.status ?? "Not opened"}
                    </span>
                    {r?.status === "DRAFT" && (
                      <div className="mt-2 flex gap-1">
                        <button
                          disabled={busy}
                          type="button"
                          className="rounded border px-2 py-1 text-xs text-emerald-700"
                          onClick={() => update(r.id, "PRESENT")}
                        >
                          All P
                        </button>
                        <button
                          disabled={busy}
                          type="button"
                          className="rounded bg-black px-2 py-1 text-xs text-white"
                          onClick={() => {
                            setReason("");
                            setOff({ registerId: r.id });
                          }}
                        >
                          Day Off
                        </button>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {students
              .filter((e) =>
                (e.fullName + " " + e.studentNumber)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((student) => (
                <tr key={student.enrollmentId} className="border-t">
                  <td className="sticky left-0 z-10 bg-white p-3 font-medium">
                    {student.fullName}
                    <span className="block text-xs font-normal text-slate-500">
                      {student.studentNumber}
                    </span>
                  </td>
                  {dates.map((date) => {
                    const r = rows.find((r) => r.date === date),
                      entry = r?.entries.find(
                        (e) => e.enrollmentId === student.enrollmentId,
                      );
                    return (
                      <td key={date} className="border-l p-3">
                        {r && entry ? (
                          <StatusControl
                            label={student.fullName + " " + date}
                            value={entry.status}
                            disabled={busy || r.status !== "DRAFT"}
                            onChange={(status) => {
                              if (status === "OFF") {
                                setReason(entry.reason ?? "");
                                setOff({ registerId: r.id, entryId: entry.id });
                              } else update(r.id, status, entry.id);
                            }}
                          />
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <th className="sticky left-0 bg-white p-3">Daily actions</th>
              {dates.map((date) => {
                const r = rows.find((r) => r.date === date);
                return (
                  <td key={date} className="border-l p-3">
                    {r?.status === "DRAFT" ? (
                      <button
                        type="button"
                        disabled={busy || r.entries.some((e) => !e.status)}
                        onClick={() => save([r.id], true)}
                        className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                      >
                        Save & submit day
                      </button>
                    ) : r ? (
                      <Link
                        className="text-xs text-emerald-700 underline"
                        href={"/dashboard/attendance/" + r.id}
                      >
                        View / correct
                      </Link>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
      {!students.length && <p>No rosters opened yet.</p>}
      <div className="sticky bottom-0 z-40 flex flex-wrap items-center gap-4 rounded-xl border bg-white p-3 shadow-sm">
        <button
          type="button"
          disabled={busy || !dirty.length}
          className={linkClass + " disabled:opacity-50"}
          onClick={() => save(dirty)}
        >
          {busy ? "Saving…" : "Save changed days"}
        </button>
        <span className="text-sm">{dirty.length} unsaved day(s)</span>
      </div>
      {message && (
        <p role="status" className="rounded-lg bg-slate-50 p-3 text-sm">
          {message}
        </p>
      )}
      <Dialog
        title={off?.entryId ? "Mark student Off" : "Mark whole day Off"}
        open={!!off}
        onClose={() => setOff(null)}
      >
        <p className="mb-4 text-sm">
          Off is excluded from attendance totals. Confirm a reason before
          applying.
        </p>
        <label className="text-sm">
          Reason
          <input
            className={inputClass}
            value={reason}
            maxLength={500}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <button
          className="mt-4 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-40"
          disabled={reason.trim().length < 3}
          onClick={() => {
            if (off) update(off.registerId, "OFF", off.entryId, reason.trim());
            setOff(null);
          }}
        >
          Confirm Off
        </button>
      </Dialog>
    </div>
  );
}
