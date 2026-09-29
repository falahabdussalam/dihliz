"use client";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Dialog } from "./Dialog";
import type { ActionState } from "@/lib/school-actions";
export default function ActionForm({
  action,
  children,
  label = "Save changes",
  className = "",
  confirm,
}: {
  action: (state: ActionState, data: FormData) => Promise<ActionState>;
  children: ReactNode;
  label?: string;
  className?: string;
  confirm?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null),
    accepted = useRef(false);
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (state.success)
      ref.current?.dispatchEvent(new Event("erp:saved", { bubbles: true }));
  }, [state]);
  return (
    <>
      <form
        ref={ref}
        action={formAction}
        onReset={(event) => event.preventDefault()}
        data-pending={pending}
        className={"space-y-4 " + className}
        onSubmit={(e) => {
          if (confirm && !accepted.current) {
            e.preventDefault();
            setConfirming(true);
          }
          accepted.current = false;
        }}
      >
        <fieldset disabled={pending} className="min-w-0 space-y-4">
          {children}
          <button
            className="rounded-lg bg-[#0b7a4b] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            type="submit"
          >
            {pending ? "Saving…" : label}
          </button>
        </fieldset>
        {state.error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}
        {state.success && (
          <p
            role="status"
            className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
          >
            {state.success}
          </p>
        )}
      </form>
      <Dialog
        title="Confirm action"
        open={confirming}
        onClose={() => setConfirming(false)}
      >
        <p className="mb-5">{confirm}</p>
        <button
          type="button"
          className="rounded-lg bg-[#0b7a4b] px-4 py-2 text-white"
          onClick={() => {
            accepted.current = true;
            setConfirming(false);
            ref.current?.requestSubmit();
          }}
        >
          Confirm
        </button>
      </Dialog>
    </>
  );
}
