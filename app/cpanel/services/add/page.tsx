import { createPageMetadata } from "@/lib/metadata";
import PageContent from "./page-content";
import { Suspense } from "react";

export const metadata = createPageMetadata("New Service | ISRA MEDA");

export default async function Page() {
  return <Suspense fallback={null}><PageContent /></Suspense>;
}
