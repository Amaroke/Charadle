// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { memoryDatabase } from "@/db/client";
import { playerStore, type PlayerStore } from "@/db/players";

describe("playerStore", () => {
  let store: PlayerStore;

  beforeEach(async () => {
    store = playerStore(await memoryDatabase());
  });

  it("creates a Player on their first sign-in", async () => {
    await store.signIn({ malId: 42, name: "luffyfan" });
    expect(await store.find(42)).toEqual({ malId: 42, name: "luffyfan" });
  });

  it("keeps a single Player across sign-ins and follows a renamed MAL account", async () => {
    await store.signIn({ malId: 42, name: "luffyfan" });
    await store.signIn({ malId: 42, name: "zorofan" });
    expect(await store.find(42)).toEqual({ malId: 42, name: "zorofan" });
    expect(await store.count()).toBe(1);
  });

  it("finds no Player for a MAL account that never signed in", async () => {
    expect(await store.find(7)).toBeUndefined();
  });
});
