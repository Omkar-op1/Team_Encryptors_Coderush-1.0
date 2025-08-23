import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import mongoose, { Schema, model, models } from "mongoose";
import jwt from "jsonwebtoken";
import cookie from "cookie";

// ⚠️ Ensure env vars are set in .env.local or project settings
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const JWT_SECRET = process.env.JWT_SECRET!;
const MONGO_URI = process.env.MONGO_URI!;
const NODE_ENV = process.env.NODE_ENV ?? "development";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- DB setup (serverless safe) ---
if (!mongoose.connection.readyState) {
  mongoose.connect(MONGO_URI);
}

const UserSchema = new Schema({
  email: { type: String, unique: true },
  name: String,
  picture: String,
  provider: { type: String, default: "google" },
});
const User = models.User || model("User", UserSchema);

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const provider="google"
    const { email, name, picture, email_verified } = payload;
    if (!email_verified) {
      return NextResponse.json({ error: "Email not verified" }, { status: 401 });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name, picture , provider });
    }

    // Create app JWT
    const token = jwt.sign({ uid: user._id,name: user.name, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Create cookie
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      cookie.serialize("app_session", token, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    );

    return NextResponse.json(
      {
        ok: true,
        user: { id: user._id, email: user.email, name: user.name, picture: user.picture },
      },
      { headers }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
