"use client";
import { useState } from "react";
import { Dialog } from "./Dialog";
export default function ConfirmButton({
  label,
  description,
  onConfirm,
  disabled = false,
}: {
  label: string;
  description: string;
  onConfirm: () => Promise<unknown>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [pending, setPending] = useState(false);
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        {label}
      </button>
      <Dialog
        title={label}
        open={open}
        onClose={() => {
          if (!pending) setOpen(false);
        }}
      >
        <div data-pending={pending}>
          <p className="mb-4 text-sm">{description}</p>
          <button
            type="button"
            disabled={pending}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-white"
            onClick={async () => {
              setPending(true);
              try {
                await onConfirm();
                setOpen(false);
              } finally {
                setPending(false);
              }
            }}
          >
            {pending ? "Saving…" : "Confirm"}
          </button>
        </div>
      </Dialog>
    </>
  );
}
