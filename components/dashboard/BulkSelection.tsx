"use client";
import { useState, type ReactNode } from "react";
import Modal from "./Dialog";
import ActionForm from "./ActionForm";
import type { ActionState } from "@/lib/school-actions";
export default function BulkSelection({
  children,
  fields,
  action,
}: {
  children: ReactNode;
  fields: ReactNode;
  action: (s: ActionState, d: FormData) => Promise<ActionState>;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div
      onChange={(e) => {
        const target = e.target as HTMLInputElement;
        if (target.name === "enrollmentIds")
          setSelected((old) =>
            target.checked
              ? [...old, target.value]
              : old.filter((id) => id !== target.value),
          );
      }}
    >
      {selected.length > 0 && (
        <div className="mb-4 flex items-center gap-4 rounded-lg bg-emerald-50 p-3">
          <span className="text-sm">{selected.length} selected</span>
          <Modal title="Promote selected students" trigger="Promote">
            <ActionForm
              action={action}
              label="Promote selected students"
              confirm="Create new-year enrollments and complete the previous enrollments?"
            >
              {selected.map((id) => (
                <input key={id} type="hidden" name="enrollmentIds" value={id} />
              ))}
              {fields}
            </ActionForm>
          </Modal>
        </div>
      )}
      {children}
    </div>
  );
}
