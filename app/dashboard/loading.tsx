export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[50vh] animate-pulse space-y-4 p-8"
    >
      <p className="text-sm text-slate-500">Loading workspace…</p>
      <div className="h-20 rounded-xl bg-slate-100" />
      <div className="h-64 rounded-xl bg-slate-100" />
    </div>
  );
}
