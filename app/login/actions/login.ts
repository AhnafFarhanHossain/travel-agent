"use server";

import { signIn } from "@/auth";
import { connectDB } from "@/lib/db";

export async function login(email: string, password: string) {
  await connectDB();
  await signIn("credentials", { email, password, redirect: false });
  return { success: true }
}
