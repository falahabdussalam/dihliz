"use client";
import { useRouter, useSearchParams } from "next/navigation";
export default function Pagination({
  currentPage,
  totalPages,
  total,
}: {
  currentPage: number;
  totalPages: number;
  total?: number;
}) {
  const router = useRouter(),
    params = useSearchParams();
  const pages = Math.max(1, totalPages);
  const numbers: (number | string)[] =
    pages <= 5
      ? Array.from({ length: pages }, (_, i) => i + 1)
      : currentPage <= 3
        ? [1, 2, 3, 4, "…", pages]
        : currentPage >= pages - 2
          ? [1, "…", pages - 3, pages - 2, pages - 1, pages]
          : [1, "…", currentPage - 1, currentPage, currentPage + 1, "…", pages];
  const go = (page: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(page));
    router.push("?" + next);
  };
  const style =
    "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
      <span className="text-xs text-slate-500">
        Page {currentPage} of {pages}
        {total !== undefined ? " · " + total + " records" : ""}
      </span>
      <nav aria-label="Pagination" className="flex gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => go(currentPage - 1)}
          className={style}
        >
          Previous
        </button>
        <div className="hidden gap-2 md:flex">
          {numbers.map((page, i) =>
            typeof page === "number" ? (
              <button
                type="button"
                key={i}
                aria-current={page === currentPage ? "page" : undefined}
                onClick={() => go(page)}
                className={
                  page === currentPage
                    ? "rounded-md border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-sm text-white"
                    : style
                }
              >
                {page}
              </button>
            ) : (
              <span key={i} className="px-2 py-1.5">
                {page}
              </span>
            ),
          )}
        </div>
        <button
          type="button"
          disabled={currentPage >= pages}
          onClick={() => go(currentPage + 1)}
          className={style}
        >
          Next
        </button>
      </nav>
    </div>
  );
}
