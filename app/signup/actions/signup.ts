"use server";

import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";

export const signUp = async (name: string, email: string, password: string) => {
  await connectDB();
  if (!name || !email || !password) {
    console.error("All fields are required");
  }

  // check if user already exists
  const userExists = await User.findOne({ email }).lean();
  if (userExists) {
    console.error("User already exists");
  }

  const hashed = await bcrypt.hash(password, 12);
  // verify the email using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("Invalid email");
  }

  // verify poassword (must be atleast 8 characters, contain at least one uppercase letter, one lowercase letter, one number)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    console.error(
      "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number",
    );
  }

  await User.create({
    name,
    email,
    password: hashed,
  });

  return {
    success: true,
    message: "User created successfully",
  };
};
