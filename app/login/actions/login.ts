"use server";

import { signIn } from "@/auth";

export async function login(email: string, password: string) {
  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}
