import Directory from "@/features/operations/Directory";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <Directory kind="performance" filters={await searchParams} />;
}
