import { boolean, date, jsonb, pgTable, primaryKey, smallint, text, timestamp } from "drizzle-orm/pg-core";
import type { DrawnCharacter } from "@/game/draw";

export const dailies = pgTable("dailies", {
  date: date("date", { mode: "string" }).primaryKey(),
  tiers: jsonb("tiers").$type<DrawnCharacter[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guestProgress = pgTable(
  "guest_progress",
  {
    date: date("date", { mode: "string" }).notNull(),
    guest: text("guest").notNull(),
    tier: smallint("tier").notNull(),
    misses: smallint("misses").notNull(),
    found: boolean("found").notNull(),
  },
  (table) => [primaryKey({ columns: [table.date, table.guest] })],
);
