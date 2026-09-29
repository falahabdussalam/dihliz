import type { Metadata } from "next";

export function createPageMetadata(
  title: string,
  description = "A school of excellence under Markaz Garden Group of Institutions",
): Metadata {
  return {
    title, description,
    openGraph: { title, description, type: "website", url: "https://dihlizworldschool.com", images: ["https://dihlizworldschool.com/thumb.jpg"] },
    twitter: { card: "summary_large_image", title, description, images: ["https://dihlizworldschool.com/thumb.jpg"] },
  };
}
