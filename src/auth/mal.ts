import { createHash } from "node:crypto";
import { customFetch } from "next-auth";
import type { OAuthConfig } from "next-auth/providers";

export type MalProfile = {
  id: number;
  name: string;
};

export type MalAuthOptions = {
  clientId: string;
  clientSecret: string;
  authUrl?: string;
  apiUrl?: string;
};

const officialAuth = "https://myanimelist.net/v1/oauth2";
const officialApi = "https://api.myanimelist.net/v2";

export function withPlainChallenge(authorizationUrl: string): string {
  const url = new URL(authorizationUrl);
  url.searchParams.set("code_challenge_method", "plain");
  return url.toString();
}

function challengeOf(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

function sendChallengeAsVerifier(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  const verifier = init?.body instanceof URLSearchParams ? init.body.get("code_verifier") : null;
  if (!verifier) return fetch(input, init);
  const body = new URLSearchParams(init!.body as URLSearchParams);
  body.set("code_verifier", challengeOf(verifier));
  return fetch(input, { ...init, body });
}

export function malProvider({
  clientId,
  clientSecret,
  authUrl = officialAuth,
  apiUrl = officialApi,
}: MalAuthOptions): OAuthConfig<MalProfile> {
  return {
    id: "mal",
    name: "MyAnimeList",
    type: "oauth",
    clientId,
    clientSecret,
    client: { token_endpoint_auth_method: "client_secret_post" },
    checks: ["pkce", "state"],
    authorization: `${authUrl}/authorize`,
    token: `${authUrl}/token`,
    userinfo: `${apiUrl}/users/@me`,
    profile: ({ id, name }) => ({ id: String(id), name }),
    [customFetch]: sendChallengeAsVerifier,
  };
}
