CREATE TABLE "daily_draws" (
	"date" date PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"failed" boolean DEFAULT false NOT NULL
);
