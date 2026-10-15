import { createPageMetadata } from "@/lib/metadata";
import PageContent from "./page-content";

export const metadata = createPageMetadata("Admission - Dihliz World School");

export default function Page() {
  return <PageContent />;
}
