import { describe, expect, it } from "vitest";
import { openTicket, sealTicket } from "@/game/ticket";

const secret = "a-test-secret-long-enough-for-hkdf";
const puzzle = { name: "Monkey D. Luffy", anime: "One Piece" };

describe("ticket", () => {
  it("opens what it sealed", () => {
    expect(openTicket(sealTicket(puzzle, secret), secret)).toEqual(puzzle);
  });

  it("does not reveal its content", () => {
    const ticket = sealTicket(puzzle, secret);
    expect(ticket).not.toMatch(/luffy|piece/i);
    expect(Buffer.from(ticket, "base64url").toString("latin1")).not.toMatch(/luffy|piece/i);
  });

  it("differs on every seal of the same puzzle", () => {
    expect(sealTicket(puzzle, secret)).not.toBe(sealTicket(puzzle, secret));
  });

  it("rejects a tampered ticket", () => {
    const ticket = sealTicket(puzzle, secret);
    const bytes = Buffer.from(ticket, "base64url");
    bytes[bytes.length - 1] ^= 1;
    expect(openTicket(bytes.toString("base64url"), secret)).toBeUndefined();
  });

  it("rejects a ticket sealed with another secret or malformed", () => {
    expect(openTicket(sealTicket(puzzle, secret), "another-secret")).toBeUndefined();
    expect(openTicket("not a ticket", secret)).toBeUndefined();
    expect(openTicket("", secret)).toBeUndefined();
  });
});
