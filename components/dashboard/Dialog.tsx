"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
export function Dialog({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeHandler = useRef(onClose);
  closeHandler.current = onClose;
  const id = useId();
  const [dirty, setDirty] = useState(false),
    [discard, setDiscard] = useState(false);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    if (open && !dialog.open) {
      setDirty(false);
      setDiscard(false);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
    return () => {
      document.body.style.overflow = overflow;
      if (dialog.open) dialog.close();
      previous?.focus();
    };
  }, [open]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty && open) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, open]);
  useEffect(() => {
    const el = ref.current;
    const saved = () => {
      setDirty(false);
      closeHandler.current();
    };
    el?.addEventListener("erp:saved", saved);
    return () => el?.removeEventListener("erp:saved", saved);
  }, []);
  const close = () => {
    if (ref.current?.querySelector('[data-pending="true"]')) return;
    if (dirty) setDiscard(true);
    else onClose();
  };
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onChangeCapture={() => setDirty(true)}
      className="dashboard-font m-auto h-fit min-h-0 max-h-[min(80dvh,44rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto overscroll-contain rounded-2xl bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/50"
    >
      <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-6 py-4">
        <h2 id={id} className="text-lg font-semibold">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Close dialog"
          onClick={close}
          className="rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>
      <div className="min-w-0 p-4 sm:p-6">
        {discard && (
          <div role="alert">
            <h3 className="font-semibold">Discard unsaved changes?</h3>
            <p className="my-3 text-sm text-slate-500">
              Your changes have not been saved.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDiscard(false)}
                className="rounded-lg border px-4 py-2"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-red-700 px-4 py-2 text-white"
              >
                Discard changes
              </button>
            </div>
          </div>
        )}
        <div hidden={discard}>{children}</div>
      </div>
    </dialog>
  );
}
export default function Modal({
  title,
  trigger,
  children,
  primary = false,
}: {
  title: string;
  trigger?: string;
  children: ReactNode;
  primary?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          primary
            ? "rounded-lg bg-[#0b7a4b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-[#0b7a4b] hover:bg-emerald-50"
        }
      >
        {trigger ?? title}
      </button>
      {mounted &&
        createPortal(
          <Dialog title={title} open={open} onClose={() => setOpen(false)}>
            {open ? children : null}
          </Dialog>,
          document.body,
        )}
    </>
  );
}
