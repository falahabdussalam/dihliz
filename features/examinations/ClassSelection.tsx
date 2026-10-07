"use client";
import { useState } from "react";
import { Panel, inputClass } from "@/components/dashboard/SchoolUI";
type Subject = {
  id: string;
  cohortId: string;
  name: string;
  studyStreamCode: string | null;
  maxMarks: number;
  passMarks: number;
};
export default function ClassSelection({
  classes,
  subjects = [],
}: {
  classes: { id: string; displayName: string }[];
  subjects?: Subject[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [marks, setMarks] = useState<
    Record<string, { pass: string; max: string }>
  >({});
  return (
    <>
      <Panel title="Streams">
        <div className="space-y-4">
          <input type="hidden" name="subjectSelection" value="1" />
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={classes.length > 0 && selected.length === classes.length}
              onChange={(e) =>
                setSelected(e.target.checked ? classes.map((c) => c.id) : [])
              }
            />
            Select all streams
          </label>
          {classes.map((c) => (
            <div key={c.id} className="rounded-lg border p-3">
              <label className="flex gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  name="cohortIds"
                  value={c.id}
                  checked={selected.includes(c.id)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? [...selected, c.id]
                        : selected.filter((id) => id !== c.id),
                    )
                  }
                />
                {c.displayName}
              </label>
              {selected.includes(c.id) && (
                <div className="mt-3 space-y-4">
                  {Array.from(
                    new Set(
                      subjects
                        .filter((s) => s.cohortId === c.id)
                        .map((s) => s.studyStreamCode ?? "Common subjects"),
                    ),
                  ).map((stream) => (
                    <fieldset key={stream} className="space-y-2">
                      <legend className="mb-2 text-xs font-semibold text-slate-500">
                        {stream.replaceAll("_", " ")}
                      </legend>
                      {subjects
                        .filter(
                          (s) =>
                            s.cohortId === c.id &&
                            (s.studyStreamCode ?? "Common subjects") === stream,
                        )
                        .map((s) => (
                          <div
                            key={s.id}
                            className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[minmax(0,1fr)_90px_90px]"
                          >
                            <label className="col-span-2 flex items-center gap-2 text-sm sm:col-span-1">
                              <input
                                type="checkbox"
                                name="subjectIds"
                                value={s.id}
                                checked={!excluded.includes(s.id)}
                                onChange={(e) =>
                                  setExcluded(
                                    e.target.checked
                                      ? excluded.filter((id) => id !== s.id)
                                      : [...excluded, s.id],
                                  )
                                }
                              />
                              {s.name}
                            </label>
                            <label className="text-xs">
                              Pass marks
                              <input
                                aria-label={s.name + " pass marks"}
                                className={inputClass}
                                name={"pass_" + s.id}
                                type="number"
                                min="0"
                                max={marks[s.id]?.max ?? s.maxMarks}
                                step="0.01"
                                value={marks[s.id]?.pass ?? String(s.passMarks)}
                                onChange={(e) =>
                                  setMarks((prev) => ({
                                    ...prev,
                                    [s.id]: {
                                      pass: e.target.value,
                                      max:
                                        prev[s.id]?.max ?? String(s.maxMarks),
                                    },
                                  }))
                                }
                                disabled={excluded.includes(s.id)}
                                required
                              />
                            </label>
                            <label className="text-xs">
                              Max marks
                              <input
                                aria-label={s.name + " maximum marks"}
                                className={inputClass}
                                name={"max_" + s.id}
                                type="number"
                                min="0.01"
                                max="10000"
                                step="0.01"
                                value={marks[s.id]?.max ?? String(s.maxMarks)}
                                onChange={(e) =>
                                  setMarks((prev) => ({
                                    ...prev,
                                    [s.id]: {
                                      max: e.target.value,
                                      pass:
                                        prev[s.id]?.pass ?? String(s.passMarks),
                                    },
                                  }))
                                }
                                disabled={excluded.includes(s.id)}
                                required
                              />
                            </label>
                          </div>
                        ))}
                    </fieldset>
                  ))}
                  <p className="text-xs text-slate-500">
                    All configured subjects are selected by default. Deselect
                    every subject to configure them later.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
