# Daily is drawn once and stored, not derived from a seed

Each Daily is drawn by a scheduled job at 12:00 UTC and its seven Tiers are stored in the database. Deriving it from a date seed looks simpler but breaks because MyAnimeList popularity rankings and character lists change over time, so the same seed would yield different Characters for different players or on replay. Storing it also lets the server reveal only the current Tier and validate Guesses without ever shipping answers to the client.
