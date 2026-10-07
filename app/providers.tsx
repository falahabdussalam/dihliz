"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    AOS.init({ easing: "ease-out-cubic", once: false, offset: 50 });
  }, []);
  useEffect(() => { AOS.refresh(); }, [pathname]);
  return children;
}
