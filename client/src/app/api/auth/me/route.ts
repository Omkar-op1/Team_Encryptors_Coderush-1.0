import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get("app_session")?.value;
    if (!cookie) return NextResponse.json({ error: "No token" }, { status: 401 });

    const decoded = jwt.verify(cookie, JWT_SECRET) as any;
    return NextResponse.json({ user: decoded });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
