import { createPageMetadata } from "@/lib/metadata";
import PageContent from "./page-content";

export const metadata = createPageMetadata("Contact Us - Dihliz World School");

export default function Page() {
  return <PageContent />;
}
