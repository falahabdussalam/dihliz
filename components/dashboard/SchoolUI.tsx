import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100";
export const linkClass =
  "inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-[#0b7a4b] hover:bg-emerald-50";
export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <h2 className="text-lg font-semibold border-b p-5 py-3.5 border-slate-200 text-[#071a33]">{title}</h2>
      <div className="p-5">{children}</div>
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
    <label className="block min-w-0 text-xs font-medium text-slate-600">
      <span className="mb-1.5 block">{label}</span>
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
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
      {children}
    </span>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-slate-500">{children}</p>;
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
          className="rounded-xl border border-slate-200 bg-white p-5"
        >
          <p className="text-xs text-slate-500">{item.label}</p>
          <p className="mt-2 text-2xl font-bold text-[#071a33]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
