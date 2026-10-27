CREATE TABLE "guest_progress" (
	"date" date NOT NULL,
	"guest" text NOT NULL,
	"tier" smallint NOT NULL,
	"misses" smallint NOT NULL,
	"found" boolean NOT NULL,
	CONSTRAINT "guest_progress_date_guest_pk" PRIMARY KEY("date","guest")
);
