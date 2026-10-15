import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10";

export const linkClass =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-800 hover:shadow-sm active:translate-y-0";

export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-all duration-200">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h3 className="text-base font-bold tracking-tight text-slate-900">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0 text-xs font-semibold text-slate-700">
      <span className="mb-1.5 block tracking-wide">{label}</span>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<{ "aria-label"?: string }>, {
            "aria-label": label,
          })
        : children}
    </label>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
      {children}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm font-medium text-slate-400">{children}</p>
    </div>
  );
}

export function Stats({
  items,
}: {
  items: Array<{ label: string; value: number | string }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {item.label}
          </p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-emerald-700">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

