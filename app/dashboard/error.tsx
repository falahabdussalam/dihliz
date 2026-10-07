"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div role="alert" className="m-8 rounded-xl border bg-white p-8">
      <h1 className="text-xl font-semibold">
        This workspace could not be loaded
      </h1>
      <p className="my-4 text-sm text-slate-500">
        Your saved records are unchanged. Try loading the page again.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  );
}
