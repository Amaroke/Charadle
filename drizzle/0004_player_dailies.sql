CREATE TABLE "player_dailies" (
	"mal_id" integer NOT NULL,
	"date" date NOT NULL,
	"score" smallint NOT NULL,
	"merged" boolean DEFAULT false NOT NULL,
	CONSTRAINT "player_dailies_mal_id_date_pk" PRIMARY KEY("mal_id","date")
);
--> statement-breakpoint
ALTER TABLE "player_dailies" ADD CONSTRAINT "player_dailies_mal_id_players_mal_id_fk" FOREIGN KEY ("mal_id") REFERENCES "public"."players"("mal_id") ON DELETE no action ON UPDATE no action;