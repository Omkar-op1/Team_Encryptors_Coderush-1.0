import { NextResponse } from "next/server";
import cookie from "cookie";

export async function POST() {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    cookie.serialize("app_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 0,
    })
  );

  return NextResponse.json({ ok: true }, { headers });
}
