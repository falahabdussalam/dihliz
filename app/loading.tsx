export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-transparent"
    >
      <div className="h-full w-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-lime-400 animate-loading-bar" />
      <span className="sr-only">Loading page...</span>
    </div>
  );
}
