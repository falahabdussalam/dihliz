import { destroySession } from "@/lib/auth";

export async function POST(request: Request) {

  await destroySession();
  return Response.json({ ok: true }, { status: 200 });
}
