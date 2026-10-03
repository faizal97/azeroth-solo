# Rare hunts and trophies: design

v10.10.0-beta.5. Roadmap item 3 ("level-60 rares with trophies"). Agreed 2026-10-03.

## Why

After 60 the game rewards collecting, not power (horizontal progression). The world has eight named rares at level
58–60 with a home place and three world bosses, but a rare respawns every 150–300 seconds at a fixed place, so it isn't rare, and
nothing remembers that you beat it. A hunt, a sighting in chat, and a trophy on your wall make them worth seeking out.

## 1. Rare hunts (level-60 rares only)

- **Which:** every named mob whose level reaches 58 or more and that has a home place (read from the data, so a new
  zone's rare joins with no rule). Levelling rares (under 58) keep their respawn timer; this is level-60 content.
- **When:** each rare appears **once in each 6-hour window**, at a time worked out from the date (UTC) and its own key,
  so every device agrees and nothing stored can drift (design mindset §3). It stays up for **30 minutes** or until
  killed. Missing a window costs nothing; the next one comes.
- **Sighting:** when one appears, a bot posts it in General ("Rare sighting: Scorchmaw at the Scorched Fen!"), a real
  message with a Travel action, like other chat requests. A rare that's up shows on the world map with a mark.
- **Its card** says what it is (level, elite or not, its health and hits, as briefings do) and "Last seen: 2 h ago"
  (a fact; never when it's next due).

## 2. Trophies

- **One per level-60 rare and per world boss** (11 today: 8 rares and 3 world bosses), earned on the **first kill by any of your characters**:
  account-wide, in the shared wardrobe's collections.
- **Hero → Journey → Trophies:** one row per zone, then a grid (design mindset §2), with a bounded count ("4 of 11").
  A trophy shows **the creature's own art on a plaque** (no new art per rare, so it's content-proof), its name, where it
  lives, and who took it and when ("Taken by Faizal, 3 Oct"). One not yet earned shows its silhouette and its zone.
- **A title at 10 trophies**, "the Big-Game Hunter". A fixed number, never "all", so new rares never move the goal.
- **No power:** trophies and the title are looks and collection only. Rare drops stay as they are.

## 3. The proof

- **Can every class do it?** (Balance Analyst) At level 60 with level-60 dungeon blues, skill 0.8: each class against
  each rare alone (non-elite) and with a world party of three (elite). Target: every class beats each non-elite alone
  at least 8 times in 10, and each elite with a world party of three at least 8 times in 10.
- **How long is the hunt?** (Balance Analyst) A player who plays one hour a day at a random time: days until 10
  trophies. Target: **about two to three weeks**, a goal, not a chore. Measured (#43): a median of **10 days** (7–14 for the middle 80%, everyone by 21; 12 for a player who logs on at the same hour). Accepted: still a goal, and stretching it would only add waiting.
- **The schedule is content-proof:** the windows are the same on two devices for the same date, and adding a rare
  doesn't shift any other rare's times (sim, the three cases none / one / many new).
