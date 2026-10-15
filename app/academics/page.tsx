import { createPageMetadata } from "@/lib/metadata";
import PageContent from "./page-content";

export const metadata = createPageMetadata("Academics - Dihliz World School");

export default function Page() {
  return <PageContent />;
}
