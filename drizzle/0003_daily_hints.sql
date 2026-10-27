ALTER TABLE "guest_progress" ADD COLUMN "hints_used" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "guest_progress" ADD COLUMN "anime_hint" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "guest_progress" ADD COLUMN "initials_hint" boolean DEFAULT false NOT NULL;