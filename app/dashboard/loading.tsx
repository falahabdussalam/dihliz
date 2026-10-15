export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="dashboard-font min-h-screen bg-[#f5f6fa] text-slate-900"
    >
      {/* Top indeterminate progress bar */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-slate-100">
        <div className="h-full w-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-lime-400 animate-loading-bar" />
      </div>

      {/* Persistent Sidebar Skeleton */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] border-r border-slate-200 bg-white shadow-[4px_0_18px_rgba(15,23,42,0.03)] lg:block">
        <div className="flex h-[74px] items-center border-b border-slate-200 px-10">
          <img
            src="/img/top.png"
            alt="Dihliz World School"
            className="h-auto w-full object-contain"
          />
        </div>
        <div className="space-y-4 px-4 py-5 animate-pulse">
          <div className="h-2.5 w-16 rounded bg-slate-200" />
          <div className="space-y-2">
            <div className="h-9 rounded-xl bg-emerald-50/80" />
            <div className="h-9 rounded-xl bg-slate-100" />
            <div className="h-9 rounded-xl bg-slate-100" />
          </div>
          <div className="h-2.5 w-20 rounded bg-slate-200 pt-2" />
          <div className="space-y-2">
            <div className="h-9 rounded-xl bg-slate-100" />
            <div className="h-9 rounded-xl bg-slate-100" />
            <div className="h-9 rounded-xl bg-slate-100" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-[258px]">
        {/* Top Header Skeleton */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-[74px] items-center justify-between px-4 sm:px-6 xl:px-8">
            <div className="space-y-1.5 animate-pulse">
              <div className="h-5 w-36 rounded-md bg-slate-200" />
              <div className="h-3 w-24 rounded bg-slate-100" />
            </div>
            <div className="flex items-center gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-slate-200" />
            </div>
          </div>
        </header>

        {/* Workspace Skeleton */}
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 xl:p-8 animate-pulse">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="h-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm" />
              <div className="h-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm" />
              <div className="h-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="h-6 w-48 rounded bg-slate-200" />
              <div className="h-4 w-72 rounded bg-slate-100" />
              <div className="h-48 rounded-lg bg-slate-50" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
