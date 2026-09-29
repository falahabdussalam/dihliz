import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/metadata";
import Providers from "./providers";
import "@/styles/globals.css";
import "aos/dist/aos.css";

export const metadata = {
  ...createPageMetadata("Dihliz World School"),
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><Providers><div data-theme="dihlizTheme">{children}</div></Providers></body></html>;
}
