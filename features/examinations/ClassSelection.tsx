"use client";
import { useState, useRef, useEffect } from "react";
export default function ClassSelection({
  classes,
}: {
  classes: { id: string; displayName: string }[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const all = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (all.current)
      all.current.indeterminate =
        selected.length > 0 && selected.length < classes.length;
  }, [selected, classes.length]);
  return (
    <fieldset className="rounded-xl border p-4">
      <legend className="px-1 text-sm font-semibold">
        Participating classes
      </legend>
      <label className="mb-3 flex items-center gap-2 border-b pb-3 text-sm font-medium">
        <input
          ref={all}
          type="checkbox"
          checked={classes.length > 0 && selected.length === classes.length}
          onChange={(e) =>
            setSelected(e.target.checked ? classes.map((c) => c.id) : [])
          }
        />{" "}
        Select all classes{" "}
        <span className="ml-auto text-slate-500">
          {selected.length} selected
        </span>
      </label>
      <div className="grid max-h-52 gap-3 overflow-y-auto sm:grid-cols-2">
        {classes.map((c) => (
          <label key={c.id} className="flex items-center gap-2 text-sm">
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
        ))}
      </div>
    </fieldset>
  );
}
