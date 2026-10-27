CREATE TABLE "players" (
	"mal_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"signed_in_at" timestamp with time zone DEFAULT now() NOT NULL
);
