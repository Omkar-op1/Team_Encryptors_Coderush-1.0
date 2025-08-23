import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {dbConnect} from "../../../lib/dbConnect";
import User from "../../../models/user";

export async function POST(req: Request) {
  await dbConnect();
  const { email, password } = await req.json();

  const user = await User.findOne({ email, provider: "manual" });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash
);
  if (!isMatch) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1d" });
  return NextResponse.json({ token, user });
}
