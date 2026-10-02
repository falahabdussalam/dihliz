"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";
export default function ExamSearch({ query }: { query: string }) {
  const [value, setValue] = useState(query),
    [pending, startTransition] = useTransition(),
    router = useRouter(),
    params = useSearchParams();
  const search = (next: string) => {
    const url = new URLSearchParams(params.toString());
    if (next.trim()) url.set("q", next.trim());
    else url.delete("q");
    url.delete("page");
    startTransition(() => router.push("?" + url));
  };
  return (
    <form
      role="search"
      aria-label="Search examinations"
      onSubmit={(e) => {
        e.preventDefault();
        search(value);
      }}
      className="relative w-full flex-1"
    >
      <FiSearch
        aria-hidden
        className="pointer-events-none absolute left-3 top-3 text-slate-400"
      />
      <input
        type="search"
        aria-label="Search exams"
        placeholder="Search exams…"
        maxLength={120}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (!e.target.value) search("");
        }}
        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            search("");
          }}
          className="absolute right-3 top-3 text-slate-400"
        >
          <FiX />
        </button>
      )}
      {pending && (
        <span role="status" className="sr-only">
          Searching exams…
        </span>
      )}
    </form>
  );
}
