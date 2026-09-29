# Cloud save (optional Google sign-in)

Status: design agreed 2026-09-29. Google Cloud side set up the same day (project "Realm of Loner",
`compelling-cat-510114-p4`, under Faizal's personal account; Testing mode; scope `drive.appdata` only).

## Goal

Players can back up their characters to their own Google Drive and carry on across devices (phone app ↔ browser ↔
another phone). Signing in is optional: without it the game works exactly as it does today.

Where the saves live: the player's own Drive, in the hidden app-data folder that only this game can see
(`drive.appdata`, a non-sensitive scope). There is no server and no database of ours; we never receive anyone's data.

## 1. What the player sees

- Settings gets a **Cloud save** section (folded; summary "Off", or "On · last backup 2 min ago").
- Signed out: one line about what it does and **Sign in with Google**. No prompts or reminders anywhere else.
- Signed in: "Signed in · last backup 2 min ago (this phone)", **Back up now**, **Restore…**, **Sign out**.
- **Back up now** saves every character on the device. Automatic backup saves the character being played: when the
  app or tab goes to the background, and at most every 10 minutes while playing.
- **Restore…** lists the characters in the cloud (name, level, class, when and where saved). A character this device
  lacks is added; one it has goes through the rules in section 2. The character limit applies: a restore that would
  go over it says so and restores nothing.
- **Sign out** forgets the sign-in on this device only; characters and cloud copies stay.
- Deleting a character asks whether to delete its cloud copy too (default: keep it).
- While Google is in Testing mode (beta), the section says only invited accounts can sign in.

## 2. Moving between devices

Each cloud file carries a **revision number**. Each device remembers, per character, the revision it last synced with
and the character's play time (`player.played`) at that moment. "Played since" means play time grew by more than a
minute, so just opening a character does not count.

| Cloud vs this device | Played here since? | Result |
|---|---|---|
| no cloud copy | – | upload (first backup) |
| same revision | no | nothing to do |
| same revision | yes | upload as the next revision |
| newer revision | no | **load it automatically**, with a toast ("Loaded your latest save from your phone") |
| newer revision | yes | **ask** |
| cloud copy exists, this device never synced it | – | **ask** |

The question shows both versions (level, when saved, which device) with **Keep this device's**, **Keep the
cloud's** and **Keep both**. Keep both turns the cloud version into a separate character, so nothing is lost.

Checks happen when the app opens or comes back, on the character screen, and just before a backup.

Rules: order comes from revision numbers, never from device clocks. Progress not yet backed up is never overwritten
without asking. Offline play works as today and syncs later.

Known limit: Drive has no lock. Two devices uploading the same character within the same moment can make one version
win silently. Switching devices by hand never does this.

## 3. How it works

- `src/cloud.js` (`window.CLOUD`), no DOM, like `update.js`. It holds the sync rules and talks to Drive through a small
  driver (`list`, `create`, `update`, `download`, `remove`), so the Node sim can swap in a fake Drive.
- Drive calls: plain REST on `https://www.googleapis.com/drive/v3` with `spaces=appDataFolder`. One file per
  character, `char-<id>.azs`, holding the save code (`G.encodeSave`). Small labels (`appProperties`: rev, name, level,
  class, race, saved at, device, play time) let the Restore list and the checks run without downloading saves.
- Mentor Marks and heirlooms (per device, in no character save) go in one more file, `account.azs`. Devices merge it
  rather than choose: heirlooms combine and the higher Mark balance wins. The same file carries the story scenes seen,
  Lore Journal pages read and tips shown, combined across devices (the tips on/off setting stays per device). Added in v10.1.1.
- Sync state stays outside the character save, in `localStorage['azsolo.cloud']`, so cloud copies carry no
  per-device bookkeeping and old saves need no migration.
- **Browser:** Google Identity Services (`accounts.google.com/gsi/client`), loaded only when a player opens Cloud save
  or is signed in. The token lasts about an hour and is kept in memory only. It is renewed on **Enter World** (a tap,
  so the popup is allowed and closes itself). In a longer session the section shows **Reconnect** until tapped.
- **Android:** Google Play services' authorisation client in `MainActivity.kt`, reached through the existing JS
  bridge (`main.dart`). Android renews the token itself. Without Google Play services, Cloud save says it is
  unavailable; save codes still work.
- Client IDs (public, not secrets): web `862031054528-shfi3s50vefl7nd0g6clotqaehqampvt.apps.googleusercontent.com`,
  Android `862031054528-l486c6s5d2rptu37h8igklk8n6t4hges.apps.googleusercontent.com` (package
  `com.starlight.azeroth_solo`, SHA-1 of the debug keystore every release is signed with).

## 4. Testing and rollout

- `sim/cloudsync.js` (run by `build.py`): a fake in-memory Drive shared by two or three fake devices. Cases: phone →
  browser → phone with automatic loads; offline conflict with each of the three choices; Keep both makes a correct
  copy; several characters; restore over the character limit; a deleted character; an expired token (backup waits,
  then succeeds); an old save with no cloud state loads as never synced.
- Manual: browser sign-in on the local preview (`127.0.0.1:8778` is an allowed origin), Faizal doing Google's sign-in
  and consent; Android on his phone with a beta APK.
- Privacy page `privacy.html` next to the game, stating only what the code does: saves go to your own Drive's hidden
  folder; we have no server; how to delete the data (Drive → Settings → Manage apps) and remove access (Google Account →
  Security → Third-party connections); the tip links go to other sites. Faizal reviews it before it goes up.
- Rollout: beta while Google is in Testing mode (only test users can sign in). Then fill the Branding page (homepage,
  privacy link), press Publish app, and ship to everyone in the next regular release. Brand verification is optional
  (it only puts the name and logo on Google's sign-in screen).

## Order of work

1. `cloud.js` sync rules and the fake-Drive sim (no Google code).
2. The real Drive driver and browser sign-in, tried on the local preview.
3. Settings UI (section, Restore list, conflict dialog, toasts).
4. Android native sign-in and a beta APK.
5. Privacy page, then publishing.
