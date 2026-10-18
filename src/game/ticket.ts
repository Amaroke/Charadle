import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const algorithm = "aes-256-gcm";
const ivLength = 12;
const tagLength = 16;

export function gameSecret(): string {
  const value = process.env.GAME_SECRET;
  if (!value) throw new Error("GAME_SECRET is not set");
  return value;
}

function keyOf(secret: string): Buffer {
  return createHash("sha256").update(`charadle-ticket:${secret}`).digest();
}

export function sealTicket(content: unknown, secret: string): string {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, keyOf(secret), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(content), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function openTicket<T>(ticket: string, secret: string): T | undefined {
  const bytes = Buffer.from(ticket, "base64url");
  if (bytes.length <= ivLength + tagLength) return undefined;
  try {
    const decipher = createDecipheriv(algorithm, keyOf(secret), bytes.subarray(0, ivLength));
    decipher.setAuthTag(bytes.subarray(ivLength, ivLength + tagLength));
    const decrypted = Buffer.concat([decipher.update(bytes.subarray(ivLength + tagLength)), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8")) as T;
  } catch {
    return undefined;
  }
}
