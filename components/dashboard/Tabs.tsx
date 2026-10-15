import Link from "next/link";
export default function Tabs({
  items,
  active,
}: {
  items: { id: string; label: string; href: string }[];
  active: string;
}) {
  return (
    <nav
      aria-label="Workspace sections"
      className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2"
    >
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          aria-current={active === item.id ? "page" : undefined}
          className={
            "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-all duration-150 " +
            (active === item.id
              ? "border-[#0b7a4b] text-[#0b7a4b] font-semibold"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/70")
          }
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
