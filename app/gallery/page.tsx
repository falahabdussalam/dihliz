import { createPageMetadata } from "@/lib/metadata";
import PageContent from "./page-content";
import getGallery from "@/functions/getGallery";

export const revalidate = 60;

export const metadata = createPageMetadata("Gallery - Dihliz World School", "Gallery of Dihliz World School");

export default async function Page() {
  const contents = await getGallery();
  return <PageContent contents={contents} />;
}
