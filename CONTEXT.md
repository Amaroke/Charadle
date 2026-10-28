# Charadle

A web game where players guess an anime character from their picture, drawing characters from MyAnimeList data.

## Language

### Game modes

**Daily**:
The ladder of seven Tiers shared by every player, renewed each day at 12:00 UTC.
_Avoid_: Daily challenge, puzzle of the day

**Tier**:
One rung of the Daily: a single main Character drawn from the whole Top N by popularity, from Top 500 (hardest) down to Top 5 (easiest), each Tier of a Daily using a different Anime. The player gets two Guesses per Tier.
_Avoid_: Level, stage, step

**Daily score**:
The value of the Tier where the player found the Character, from 7 (Top 500) to 1 (Top 5), minus one per Hint used, never below 0, and 0 if every Tier is failed.
_Avoid_: Points, result

**Streak**:
The number of consecutive Dailies a Player finished with a Daily score of 1 or more.
_Avoid_: Series, combo

**Free play**:
An unlimited sequence of randomly drawn puzzles, chosen with the player's own settings.
_Avoid_: Random mode, endless mode

### Puzzle

**Anime**:
The work a Character comes from, shown by its title in the player's language when one is known, otherwise its English title, otherwise its romaji title.
_Avoid_: Show, series, work

**Character**:
The anime character the player must name, shown by their picture.
_Avoid_: Target, answer

**Guess**:
One name submitted by the player for the current Character, accepted if it matches the first name, last name or an alias, ignoring case and accents and tolerating one typo on words of five letters or more.
_Avoid_: Attempt, try, tentative

**Hint**:
An optional reveal that helps the player: the Anime title, the initials of the Character's name, or in Free play a Multiple choice.
_Avoid_: Clue, help

**Multiple choice**:
A Free play Hint, available after three failed Guesses, offering four Characters from the same Anime when possible, where a wrong pick loses the puzzle.
_Avoid_: Quiz, MCQ

**Give up**:
Ending a puzzle as lost and revealing the Character and Anime.
_Avoid_: Reveal all, forfeit

### Settings

**Difficulty**:
Which Characters can be drawn from an Anime: Normal draws only main characters, Expert draws any character. The Daily always uses Normal.
_Avoid_: Level, mode

**Anime pool**:
The set of anime a puzzle's Anime is drawn from: a Top N by popularity matching the Tiers, or a MAL list filtered by watch status and minimum player rating.
_Avoid_: List, current list

### Players

**Player**:
Someone signed in with their MyAnimeList account, whose stats are stored and who appears on the Leaderboard.
_Avoid_: User, account

**Guest**:
Someone playing without signing in, whose stats live only in their browser and are merged into their Player stats on sign-in.
_Avoid_: Anonymous, visitor

**MAL list**:
The anime list of a MyAnimeList user, the signed-in Player's own or any username typed by a Guest.
_Avoid_: User list, anime list

**Leaderboard**:
The ranking of Players by Daily results only, built from Dailies played while signed in, including the current Daily finished as a Guest just before signing in: today's Daily score, average Daily score over at least seven Dailies, and current Streak.
_Avoid_: Ranking, scoreboard
