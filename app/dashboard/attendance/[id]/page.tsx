import Workspace from "@/features/operations/Workspace";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <Workspace kind="attendance" id={(await params).id} />;
}
