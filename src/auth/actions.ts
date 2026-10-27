"use server";

import { redirect } from "next/navigation";
import { withPlainChallenge } from "@/auth/mal";
import { signIn, signOut } from "@/auth/session";

export async function signInWithMal(redirectTo: string): Promise<void> {
  const authorizationUrl = await signIn("mal", { redirectTo, redirect: false });
  redirect(withPlainChallenge(authorizationUrl));
}

export async function signOutOfMal(redirectTo: string): Promise<void> {
  await signOut({ redirectTo });
}
