"use client";
import { useState, useRef, useEffect, type ReactNode } from "react";
export default function Popover({
  label,
  title,
  children,
  width = "w-[min(400px,85vw)]",
  align = "end",
}: {
  label: string;
  title: string;
  children: ReactNode;
  width?: string;
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false),
    ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; right: "auto" }>();
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (
        !(e.target as Element).closest?.("[data-dashboard-select]") &&
        !ref.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);
  return (
    <div
      ref={ref}
      className="relative"
      onClickCapture={(e) => {
        if ((e.target as Element).closest("a")) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          if (!open && ref.current) {
            const bounds = ref.current.getBoundingClientRect();
            const size =
              width === "w-56" ? 224 : Math.min(400, window.innerWidth * 0.85);
            const desired =
              align === "start" ? bounds.left : bounds.right - size;
            setPosition({
              left:
                Math.max(8, Math.min(desired, window.innerWidth - size - 8)) -
                bounds.left,
              right: "auto",
            });
          }
          setOpen(!open);
        }}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium hover:bg-slate-50"
      >
        {label}
        <span aria-hidden>⌄</span>
      </button>
      {open && (
        <div
          style={position}
          className={
            "absolute right-0 z-40 mt-2 max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl " +
            width
          }
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{title}</h3>
            <button
              type="button"
              aria-label={"Close " + title}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  );
}
