"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Pagination({
  currentPage,
  totalPages,
  total,
}: {
  currentPage: number;
  totalPages: number;
  total?: number;
}) {
  const params = useSearchParams();
  const pages = Math.max(1, totalPages);
  const numbers: (number | string)[] =
    pages <= 5
      ? Array.from({ length: pages }, (_, i) => i + 1)
      : currentPage <= 3
        ? [1, 2, 3, 4, "…", pages]
        : currentPage >= pages - 2
          ? [1, "…", pages - 3, pages - 2, pages - 1, pages]
          : [1, "…", currentPage - 1, currentPage, currentPage + 1, "…", pages];

  const getHref = (page: number) => {
    const next = new URLSearchParams(params?.toString() ?? "");
    next.set("page", String(page));
    return "?" + next.toString();
  };

  const btnBase =
    "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50/60 hover:text-[#0b7a4b] hover:shadow active:translate-y-0";
  const btnActive =
    "inline-flex items-center justify-center rounded-lg border border-[#0b7a4b] bg-[#0b7a4b] px-3.5 py-1.5 text-sm font-bold text-white shadow-sm shadow-emerald-700/25 transition-all duration-200 pointer-events-none";
  const btnDisabled =
    "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-400 opacity-60 cursor-not-allowed select-none";

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
      <span className="text-xs font-medium text-slate-500">
        Page {currentPage} of {pages}
        {total !== undefined ? " · " + total + " records" : ""}
      </span>
      <nav aria-label="Pagination" className="flex items-center gap-2">
        {currentPage <= 1 ? (
          <span className={btnDisabled} aria-disabled="true">
            Previous
          </span>
        ) : (
          <Link
            href={getHref(currentPage - 1)}
            scroll={false}
            prefetch={true}
            className={btnBase}
            aria-label="Go to previous page"
          >
            Previous
          </Link>
        )}

        <div className="hidden items-center gap-1.5 md:flex">
          {numbers.map((page, i) =>
            typeof page === "number" ? (
              page === currentPage ? (
                <span key={i} aria-current="page" className={btnActive}>
                  {page}
                </span>
              ) : (
                <Link
                  key={i}
                  href={getHref(page)}
                  scroll={false}
                  prefetch={true}
                  className={btnBase}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </Link>
              )
            ) : (
              <span key={i} className="px-2 py-1.5 text-sm text-slate-400 select-none">
                {page}
              </span>
            ),
          )}
        </div>

        {currentPage >= pages ? (
          <span className={btnDisabled} aria-disabled="true">
            Next
          </span>
        ) : (
          <Link
            href={getHref(currentPage + 1)}
            scroll={false}
            prefetch={true}
            className={btnBase}
            aria-label="Go to next page"
          >
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}

