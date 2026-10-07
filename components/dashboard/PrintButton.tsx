"use client";
export default function PrintButton() {
  return (
    <button
      className="rounded-lg border px-4 py-2 text-sm print:hidden"
      onClick={() => window.print()}
    >
      Print / Save PDF
    </button>
  );
}
