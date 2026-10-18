import { date, jsonb, pgTable, timestamp } from "drizzle-orm/pg-core";
import type { DrawnCharacter } from "@/game/draw";

export const dailies = pgTable("dailies", {
  date: date("date", { mode: "string" }).primaryKey(),
  tiers: jsonb("tiers").$type<DrawnCharacter[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
