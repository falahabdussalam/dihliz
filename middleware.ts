import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import isLogged from "./functions/isLogged";
import { isLoggedServer } from "./functions/decode-server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!isLoggedServer(token)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/cpanel/:path*",
};
