"use server";

import { cookies } from "next/headers";

const COOKIE = "sadmin_auth";
const COOKIE_OPTS = {
  httpOnly: true,
  path: "/",
  sameSite: "strict" as const,
  maxAge: 60 * 60 * 24, // 24 h
};

export async function login(password: string): Promise<{ error?: string }> {
  if (!process.env.ADMIN_SECRET || password !== process.env.ADMIN_SECRET)
    return { error: "Wrong password." };
  cookies().set(COOKIE, "1", COOKIE_OPTS);
  return {};
}

export async function logout() {
  cookies().delete(COOKIE);
}
