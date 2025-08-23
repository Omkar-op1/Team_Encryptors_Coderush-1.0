import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {dbConnect} from "../../../lib/dbConnect";
import User from "../../../models/user";

export async function POST(req: Request) {
  await dbConnect();
  const { name, email, password } = await req.json();

  // check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create new user
  const user = await User.create({
    name,
    email,
    passwordHash: hashedPassword,
    provider: "manual",
  });

  return NextResponse.json({ message: "Signup successful", user });
}
