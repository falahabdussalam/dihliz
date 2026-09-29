import { createPageMetadata } from "@/lib/metadata";
import PageContent from "./page-content";
import { Suspense } from "react";

export const metadata = createPageMetadata("Academics - Dihliz World School");

export default async function Page() {
  return <Suspense fallback={null}><PageContent /></Suspense>;
}
