// @vitest-environment node
import { createHash } from "node:crypto";
import { customFetch } from "next-auth";
import { describe, expect, it, vi } from "vitest";
import { malProvider, withPlainChallenge } from "@/auth/mal";

const options = {
  clientId: "client-id",
  clientSecret: "client-secret",
  authUrl: "https://mal.test/v1/oauth2",
  apiUrl: "https://api.mal.test/v2",
};

function challengeOf(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

describe("withPlainChallenge", () => {
  it("asks MAL for a plain challenge and keeps the other parameters", () => {
    const url = withPlainChallenge(
      "https://mal.test/v1/oauth2/authorize?client_id=client-id&state=abc&code_challenge=xyz&code_challenge_method=S256",
    );
    const { searchParams } = new URL(url);
    expect(searchParams.get("code_challenge_method")).toBe("plain");
    expect(searchParams.get("code_challenge")).toBe("xyz");
    expect(searchParams.get("state")).toBe("abc");
    expect(searchParams.get("client_id")).toBe("client-id");
  });
});

describe("malProvider", () => {
  it("points to the MAL authorization, token and user endpoints", () => {
    const provider = malProvider(options);
    expect(provider.id).toBe("mal");
    expect(String(provider.authorization)).toBe("https://mal.test/v1/oauth2/authorize");
    expect(provider.token).toBe("https://mal.test/v1/oauth2/token");
    expect(provider.userinfo).toBe("https://api.mal.test/v2/users/@me");
    expect(provider.checks).toEqual(["pkce", "state"]);
  });

  it("sends the challenge as the code verifier, since MAL only knows plain challenges", async () => {
    const fetch = vi.fn(async () => new Response("{}"));
    vi.stubGlobal("fetch", fetch);
    const body = new URLSearchParams({ grant_type: "authorization_code", code: "code", code_verifier: "verifier" });
    await malProvider(options)[customFetch]!("https://mal.test/v1/oauth2/token", { method: "POST", body });
    const sent = (fetch.mock.calls[0] as unknown[])[1] as RequestInit;
    expect(new URLSearchParams(sent.body as URLSearchParams).get("code_verifier")).toBe(challengeOf("verifier"));
    vi.unstubAllGlobals();
  });

  it("leaves requests without a code verifier untouched", async () => {
    const fetch = vi.fn(async () => new Response("{}"));
    vi.stubGlobal("fetch", fetch);
    const init = { headers: { authorization: "Bearer token" } };
    await malProvider(options)[customFetch]!("https://api.mal.test/v2/users/@me", init);
    expect(fetch).toHaveBeenCalledWith("https://api.mal.test/v2/users/@me", init);
    vi.unstubAllGlobals();
  });

  it("turns the MAL user into a Player", () => {
    const user = malProvider(options).profile!({ id: 42, name: "luffyfan" }, {});
    expect(user).toEqual({ id: "42", name: "luffyfan" });
  });
});
