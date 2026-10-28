import NextAuth from "next-auth";
import { connection } from "next/server";
import { malProvider, type MalProfile } from "@/auth/mal";
import { database } from "@/db/client";
import { playerStore } from "@/db/players";
import { claimGuestDaily } from "@/game/daily-game";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  providers: [
    malProvider({
      clientId: required("MAL_CLIENT_ID"),
      clientSecret: required("MAL_CLIENT_SECRET"),
      authUrl: process.env.MAL_AUTH_URL || undefined,
      apiUrl: process.env.MAL_API_URL || undefined,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const { id, name } = profile as unknown as MalProfile;
        await playerStore(await database()).signIn({ malId: id, name });
        await claimGuestDaily(id);
        token.malId = id;
      }
      return typeof token.malId === "number" ? token : null;
    },
    session({ session, token }) {
      if (typeof token.malId === "number") session.user.id = String(token.malId);
      return session;
    },
  },
}));

export type SignedInPlayer = { malId: number; name: string };

export async function signedInPlayer(): Promise<SignedInPlayer | undefined> {
  await connection();
  try {
    const user = (await auth())?.user;
    const malId = Number(user?.id);
    return user?.name && Number.isInteger(malId) ? { malId, name: user.name } : undefined;
  } catch (error) {
    console.error("The session could not be read", error);
    return undefined;
  }
}

export async function playerName(): Promise<string | undefined> {
  await connection();
  try {
    return (await auth())?.user?.name ?? undefined;
  } catch (error) {
    console.error("The session could not be read", error);
    return undefined;
  }
}
