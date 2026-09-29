import RelatedDirectory from "@/features/students/RelatedDirectory";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <RelatedDirectory kind="reports" filters={await searchParams} />;
}
