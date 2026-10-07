"use client";
import StatusControl, { type AttendanceStatus } from "./AttendanceStatus";
import { useState, useEffect } from "react";
import ActionForm from "@/components/dashboard/ActionForm";
import Modal from "@/components/dashboard/Dialog";
import { Field, inputClass } from "@/components/dashboard/SchoolUI";
import { saveRegister } from "./actions";
import type { Criterion } from "./rules";
type Entry = {
  id: string;
  fullName: string;
  studentNumber: string;
  status?: string | null;
  reason?: string | null;
  scores?: Record<string, { value: number | null; na: boolean }>;
  remarks?: string | null;
};
export default function RegisterGrid({
  id,
  revision,
  kind,
  criteria = [],
  entries,
}: {
  id: string;
  revision: number;
  kind: "attendance" | "performance";
  criteria?: Criterion[];
  entries: Entry[];
}) {
  const [rows, setRows] = useState(entries),
    [offReason, setOffReason] = useState(""),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    setRows(entries);
    setDirty(false);
  }, [revision, entries]);
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
  const update = (id: string, patch: Partial<Entry>) => {
    setDirty(true);
    setRows(rows.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };
  return (
    <div className="space-y-4">
      {kind === "attendance" && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm"
            onClick={() => {
              setRows(
                rows.map((e) => ({ ...e, status: "PRESENT", reason: null })),
              );
              setDirty(true);
            }}
          >
            Mark all Present
          </button>
          <Modal title="Mark whole class Off">
            <p className="mb-4 text-sm">
              This marks every student Off and excludes this date from
              attendance percentages. Review before saving.
            </p>
            <Field label="Reason">
              <input
                className={inputClass}
                value={offReason}
                onChange={(e) => setOffReason(e.target.value)}
                maxLength={500}
              />
            </Field>
            <button
              type="button"
              disabled={offReason.trim().length < 3}
              className="mt-4 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
              onClick={(e) => {
                setRows(
                  rows.map((row) => ({
                    ...row,
                    status: "OFF",
                    reason: offReason.trim(),
                  })),
                );
                setDirty(true);
                e.currentTarget.dispatchEvent(
                  new Event("erp:saved", { bubbles: true }),
                );
              }}
            >
              Confirm whole class Off
            </button>
          </Modal>
        </div>
      )}
      <ActionForm key={revision} action={saveRegister} label="Save draft">
        <input type="hidden" name="registerId" value={id} />
        <input type="hidden" name="revision" value={revision} />
        <input type="hidden" name="kind" value={kind} />
        <p className="text-sm text-slate-500">
          {dirty ? "Unsaved changes. " : ""}
          {kind === "attendance"
            ? "Unmarked students stay incomplete. Off is excluded from attendance percentages."
            : "Enter a number, including zero, or NA. Blank cells are incomplete."}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-3">Student</th>
                {kind === "attendance" ? (
                  <>
                    <th>Status</th>
                    <th>Off reason</th>
                  </>
                ) : (
                  <>
                    {criteria.map((c) => (
                      <th className="min-w-[140px] p-2" key={c.id}>
                        {c.name}
                        <span className="block text-xs font-normal text-slate-500">
                          Maximum {c.maximum} · v{c.version}
                        </span>
                      </th>
                    ))}
                    <th>Remarks</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3">
                    <input type="hidden" name="entryIds" value={e.id} />
                    {e.fullName}
                    <span className="block text-xs text-slate-500">
                      {e.studentNumber}
                    </span>
                  </td>
                  {kind === "attendance" ? (
                    <>
                      <td className="p-2">
                        <input
                          type="hidden"
                          name={"status:" + e.id}
                          value={e.status ?? ""}
                        />
                        <StatusControl
                          label={e.fullName + " status"}
                          value={(e.status || null) as AttendanceStatus}
                          onChange={(status) =>
                            update(e.id, {
                              status,
                              reason: status === "OFF" ? e.reason : null,
                            })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          aria-label={e.fullName + " Off reason"}
                          name={"reason:" + e.id}
                          className={inputClass}
                          value={e.reason ?? ""}
                          onChange={(v) =>
                            update(e.id, { reason: v.target.value })
                          }
                          maxLength={500}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      {criteria.map((c) => (
                        <td key={c.id} className="p-2">
                          <input
                            aria-label={e.fullName + " " + c.name}
                            name={"score:" + e.id + ":" + c.id}
                            className={inputClass}
                            defaultValue={
                              e.scores?.[c.id]?.na
                                ? "NA"
                                : (e.scores?.[c.id]?.value ?? "")
                            }
                            onChange={() => setDirty(true)}
                            maxLength={8}
                          />
                        </td>
                      ))}
                      <td>
                        <input
                          aria-label={e.fullName + " remarks"}
                          name={"remarks:" + e.id}
                          className={inputClass}
                          defaultValue={e.remarks ?? ""}
                          maxLength={1000}
                          onChange={() => setDirty(true)}
                        />
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <label className="flex gap-2 text-sm">
          <input type="checkbox" name="intent" value="submit" /> Submit this
          register after saving (requires every cell marked)
        </label>
      </ActionForm>
    </div>
  );
}
