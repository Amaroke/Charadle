CREATE TABLE "dailies" (
	"date" date PRIMARY KEY NOT NULL,
	"tiers" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
