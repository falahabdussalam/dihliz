"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FiGrid, FiList } from "react-icons/fi";

interface ExamsViewToggleProps {
  currentView: string;
}

export default function ExamsViewToggle({ currentView }: ExamsViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setView = (view: "list" | "grid") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    params.delete("page"); // reset to page 1 when switching views
    router.push(`${pathname}?${params.toString()}`);
  };

  const isGrid = currentView === "grid";

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => setView("list")}
        aria-label="List view"
        aria-pressed={!isGrid}
        className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${
          !isGrid
            ? "bg-emerald-700 text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        }`}
      >
        <FiList size={14} />
        List
      </button>
      <button
        type="button"
        onClick={() => setView("grid")}
        aria-label="Grid view"
        aria-pressed={isGrid}
        className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${
          isGrid
            ? "bg-emerald-700 text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        }`}
      >
        <FiGrid size={14} />
        Grid
      </button>
    </div>
  );
}