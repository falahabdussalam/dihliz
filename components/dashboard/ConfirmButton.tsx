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
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none active:translate-y-0"
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
            className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 active:translate-y-0"
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
