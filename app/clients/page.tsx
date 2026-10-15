import { createPageMetadata } from "@/lib/metadata";
import PageContent from "./page-content";

export const metadata = createPageMetadata("Clients - Dihliz World School");

export default function Page() {
  return <PageContent />;
}
