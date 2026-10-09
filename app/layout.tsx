import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/metadata";
import Providers from "./providers";
import "@/styles/globals.css";
import { Toaster } from "sonner";
import "aos/dist/aos.css";

export const metadata = {
  ...createPageMetadata("Dihliz World School"),
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Manrope subset used only for digits; Raleway's old-style numerals read poorly */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&text=0123456789%2B%25%C3%97&display=swap"
        />
      </head>
      <body>
        <Providers>
          <div data-theme="dihlizTheme">{children}</div>
        </Providers>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
