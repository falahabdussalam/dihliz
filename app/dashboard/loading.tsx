export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="dashboard-font min-h-screen bg-[#f8fafc] text-slate-900"
    >
      {/* Top indeterminate progress bar */}
      <div className="fixed inset-x-0 top-0 z-50 h-[2.5px] overflow-hidden bg-transparent">
        <div className="h-full w-full bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-500 animate-loading-bar" />
      </div>

      {/* Persistent Sidebar Skeleton */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] border-r border-slate-200/80 bg-white shadow-[1px_0_10px_rgba(15,23,42,0.02)] lg:block">
        <div className="flex h-16 items-center px-5 border-b border-slate-100 bg-white">
          <img
            src="/img/top.png"
            alt="Dihliz World School"
            className="h-8 w-auto max-w-[170px] object-contain opacity-70"
          />
        </div>
        <div className="space-y-4 px-3.5 py-4 animate-pulse">
          <div className="h-2.5 w-16 rounded bg-slate-200" />
          <div className="space-y-1.5">
            <div className="h-8 rounded-xl bg-emerald-50/80 border border-emerald-100" />
            <div className="h-8 rounded-xl bg-slate-100/70" />
            <div className="h-8 rounded-xl bg-slate-100/70" />
          </div>
          <div className="h-2.5 w-20 rounded bg-slate-200 pt-2" />
          <div className="space-y-1.5">
            <div className="h-8 rounded-xl bg-slate-100/70" />
            <div className="h-8 rounded-xl bg-slate-100/70" />
            <div className="h-8 rounded-xl bg-slate-100/70" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-[258px]">
        {/* Top Header Skeleton */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
            <div className="flex items-center gap-2.5 animate-pulse">
              <div className="h-5 w-32 rounded-md bg-slate-200" />
              <div className="h-5 w-20 rounded-full bg-slate-100" />
            </div>
            <div className="flex items-center gap-2.5 animate-pulse">
              <div className="h-7 w-28 rounded-xl bg-slate-100" />
            </div>
          </div>
        </header>

        {/* Workspace Skeleton */}
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 animate-pulse">
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="h-28 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs" />
              <div className="h-28 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs" />
              <div className="h-28 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs" />
            </div>
            <div className="space-y-3">
              <div className="h-5 w-36 rounded bg-slate-200" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="h-28 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs" />
                <div className="h-28 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs" />
                <div className="h-28 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
