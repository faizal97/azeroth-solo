# Honor ranks: design

v10.10.0-beta.8. Roadmap item 3 ("Honor ranks in battlegrounds for looks and titles"). Agreed 2026-10-03 (Faizal
approved adding it to v10.10).

## Why

Honor today is a lifetime counter (battlegrounds and War Mode kills) with four title thresholds (100, 500, 1,500 and
4,000), and nothing shows how far you are or what's next. Those four titles also use Warcraft's own PvP ladder
(Private, Corporal, Sergeant, Knight; Scout, Grunt, Stone Guard), which design mindset §6 rules out. A visible rank
ladder with our own names, insignia and a few looks gives PvP the same long goal the rest of the level-60 loop has.

## 1. The ladder

- **Eight ranks from lifetime Honor**, per faction, each a title. Ranks 1–4 keep today's thresholds (100 / 500 / 1,500 /
  4,000), so nobody loses a title; ranks 5–8 get new thresholds from the sim (§3).
- **No decay and no spending.** Lifetime Honor only goes up (nothing punishes a day off), and it's the only number, so
  there is never a second "Honor you can spend" to explain.
- **Our own names** (Faizal may change any; `tools/ipcheck.js` and `tools/lorekeeper.js` check them):

| Rank | Accord | Krugar |
|---|---|---|
| 1 | Recruit | Whelp |
| 2 | Shieldbearer | Bloodied |
| 3 | Banneret | Raider |
| 4 | Lancer | Tusker |
| 5 | Warden of the Line | Ironhide |
| 6 | Lantern Captain | Warbringer |
| 7 | High Guard | Skullbearer |
| 8 | Lord of the Accord | Hand of the Krugar |

- **Saves:** titles keep their ids (`pvp1`–`pvp4`), so a player who holds "Sergeant" now holds "Banneret". Say so in the
  beta notes.

## 2. What the player sees

- **PvP tab:** "Rank 3 of 8: Banneret. 1,200 of 1,500 Honor to Rank 4: Lancer." A bounded number, and the next step
  named (design mindset §1 and §2). Tap for the whole ladder with thresholds and what each rank gives.
- **Insignia:** a small rank badge (8 per faction, one small art pack) next to a player's name on the battleground
  scoreboard and the party frames, for you and for bots (bots' ranks come from their own Honor, so a veteran bot shows
  a high rank).
- **Looks at ranks 3, 5 and 8,** per faction, in the shared wardrobe: a tabard, a cloak and a war banner worn on the
  back. Three looks per faction, drawn in each faction's colours.
- **No power,** as the roadmap says: titles, insignia and looks only.

## 3. The proof (Balance Analyst)

- **Honor per hour at levels 20, 40 and 60:** battlegrounds (wins and losses at the sim's win rate) and War Mode kills,
  seeded.
- **Set ranks 5–8** so rank 8 takes about **30 hours of PvP at level 60** (a long goal, not a grind), with the steps
  between growing evenly. Report how long ranks 1–4 take today.
- **Bots' ranks:** a believable spread on the server (most bots low, a few at 7–8), from their simulated play time.
