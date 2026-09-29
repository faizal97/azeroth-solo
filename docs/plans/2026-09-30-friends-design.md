# Friends: design

2026-09-30. Status: section 1 agreed with Faizal; sections 2–5 written while he was away, **to review**.

Real players add each other by friend code and see each other's characters, gear and online status, live. It is
the first online feature, and it is built as the base for co-op later: who your friends are, who is online, and
what they play.

## Decisions so far

- **Firebase**, in the existing Google Cloud project (compelling-cat-510114-p4), free Spark plan, no billing.
  - **Firestore** (Jakarta, asia-southeast2) holds friend codes, requests, friend lists and profiles.
  - **Realtime Database** (Singapore, asia-southeast1) holds only online status, because it marks a player offline
    the moment their connection drops (`onDisconnect`), which co-op will need.
  - No server code (Cloud Functions would need the paid plan). Security rules do the checking.
- **Sign-in** is the Google sign-in the game already has, plus the `openid` scope ("who is this", no email),
  handed to Firebase Auth. Proven in the test run on 2026-09-30: web and Android app, same Firebase id for the same
  Google account on both, live update across devices in under a second.
- **A friend is a person** (a Google account), not a character. You see all their shared characters.
- **Request, then accept.** A code alone never adds anyone.
- **Friends is its own opt-in**, separate from cloud save. Nothing leaves the device until the player turns it on.
- **Shared:** characters and gear; online now and which character; where you are; guild and achievements; role and
  talents; professions; last seen. Every character is shared by default, with a per-character switch.
- **Not in this version:** messages between friends, gifts or trades, friends appearing in your world as simulated
  players (roadmap item 9), co-op itself.

Free-plan limits (firebase.google.com/pricing, checked 2026-09-30): Realtime Database 100 simultaneous
connections, 1 GB stored, 10 GB/month downloaded; Firestore 1 GiB stored, 20K writes, 50K reads and 20K deletes a
day, 10 GiB/month egress; Authentication 50K monthly active users.

## 1. What the player sees (agreed)

A new **Friends** tab in Social, beside Group Finder, Chat, Realm News and Guild.

- **Turning it on.** First visit explains Friends and offers **Turn on Friends**: one tap when cloud save is already
  on, otherwise Google's window. Turning Friends off deletes the profile from Firebase; the friend list is kept, so
  turning it on again brings it back.
- **Your friend code** at the top (like **K7QM-P2XD**) with **Copy** and **Share**. Share sends a link
  (`…/realm-of-loner/#friend=K7QM-P2XD`) that fills the code in when opened in the game.
- **Adding.** **Add** takes a code and sends a request. The other player sees it under **Requests** (with the name
  and class of the character they sent it from) and taps **Accept** or **Decline**. Your own pending requests show
  as waiting, with **Cancel**.
- **The list.** Online friends first, with a green dot and "Playing Brannoc, level 34 Warrior · Elderglen, Hornhold";
  offline friends show "Last played 3 hours ago". Tapping a friend opens their profile: each shared character with
  portrait, level, race and class, role and talents, professions, guild and rank, titles and collection counts.
  Tapping a character shows their gear laid out like your own Hero screen, read-only, with full item tooltips.
  **Remove friend** is at the bottom.
- **My sharing.** A switch per character, on by default. Hiding a character removes it from friends' view at once,
  including "playing" and location while you are on it (friends then see only "Online").
- **A dot on the Social button** when a request is waiting, like the Bounty Board markers.

## 2. The data (to review)

### Firestore (Jakarta)

| Path | Holds | Written by |
|---|---|---|
| `codes/{code}` | `{ uid }` | the owner, once per code |
| `profiles/{uid}` | what friends see (below) | the owner |
| `requests/{to}/in/{from}` | `{ name, cls, level, at }` of the sender's current character | the sender |
| `friends/{uid}/list/{other}` | `{ since }` | see the rules |

A profile is one document, a few kilobytes even with ten characters:

- `v` (format version), `code`, `updatedAt`
- `playing`: `{ char, zone, place, run }` for the character being played, or `null` when it is hidden
- `lastSeen`: when the player was last in the game (for "last played 3 hours ago")
- `chars`: one entry per **shared** character: `name`, `race`, `cls`, `look`, `level`, `role`, `talents` (the points
  per talent, as saved), `profs` (profession and skill), `guild` (`name`, `rank`), `title`, collection counts, and
  `gear`: the equipped items **as saved** (each is the item's own copy, with its name, quality and stats). Storing
  the item itself, not just its id, means a friend on an older version of the game still sees the right item.

### Realtime Database (Singapore)

| Path | Holds | Written by |
|---|---|---|
| `status/{uid}/{conn}` | `{ at, char }`: one entry per open game (phone, browser tab), with the character id when it is shared | the owner; the server removes it by `onDisconnect` |
| `see/{uid}/{other}` | `true`: the friends allowed to read this player's status | the owner |

A player is online while `status/{uid}` has any entry, so closing the browser does not mark them offline while
their phone is still playing; "playing" is the newest entry's character. Realtime Database rules cannot look into Firestore, so each player keeps their own `see` list. The game keeps it
equal to their Firestore friend list every time it starts (adds the missing ones, removes the stale ones), so it
repairs itself if a step was ever interrupted.

### When the game writes

- **Profile:** when Friends is turned on, when a character is loaded, and after a change friends would notice
  (level, gear, talents, professions, guild, title, zone). Changes are gathered and written **at most once a
  minute**, and once more when the game goes to the background.
- **Status:** an entry while the game is open and visible; `onDisconnect` removes it when the connection drops,
  and the game removes it itself when it goes to the background.

### Several devices

A player may have different characters on different devices (cloud save copies them only when asked). So a device
never rewrites the whole profile: it updates only the characters it has (`chars.<id>`), and removes one only when it
is deleted or hidden on that device. The **share switch is saved in the character itself** (`player.friendsHidden`),
so cloud save carries it to the other devices.

Rough cost: one player playing for two hours writes about 120 profile updates at most, often far fewer. The
free plan's 20K writes a day covers about 150 such players a day. Reads grow with friends × updates; the same
estimate gives room for several hundred. When a limit is reached, Firebase stops answering until the next day:
friends then show as offline and the game itself carries on unaffected. With no billing account, there is no
bill.

## 3. Security rules (to review)

The rules live in the repo (`firebase/firestore.rules`, `firebase/database.rules.json`) and are tested before they
are published (section 5).

**Firestore**

- `codes/{code}`: any signed-in player may **get** one code (to add a friend), never **list** them. Create only for
  your own uid and only if the code is free; delete only your own. Codes use 8 characters from a 31-letter alphabet
  without look-alikes (no 0/O, 1/I/L): about 850 billion codes, so guessing one is hopeless.
- `profiles/{uid}`: read by the owner, or by a player on the owner's friend list
  (`exists(friends/{uid}/list/{reader})`). Write by the owner only, with a size limit and known fields only.
- `requests/{to}/in/{from}`: create only as `from`, never to yourself, known fields only. Read and delete by either
  side (Accept, Decline and Cancel all delete it).
- `friends/{owner}/list/{other}`:
  - the owner may add or remove anyone on their own list (they are only choosing who may see *their* profile);
  - `other` may add themselves to the owner's list **only while a request from the owner to them exists**: that is
    Accept. The owner agreed when they sent the request;
  - either side may delete (Remove friend removes both entries).

Accepting A's request, B writes `friends/B/list/A` and `friends/A/list/B`, then deletes the request. Nobody can put
themselves on someone's list without that person's request.

**Realtime Database**

- `status/$uid`: read by the owner or by anyone in `see/$uid`; each `$conn` written by the owner only, with `at`
  and an optional `char`, nothing else.
- `see/$uid`: read and write by the owner only.

## 4. How it fits in the game (to review)

- **`src/friends.js`** (`FRIENDS`), next to `cloud.js`. It loads the Firebase SDK from gstatic only when Friends is
  on, the way cloud save loads Google's script only when needed. Players who never turn Friends on never download it.
- **Sign-in.** On the web, a Google token with the `openid` scope (as in the test run); in the app, the AzCloud
  bridge's `token` with `scopes: ['openid']` (already in the beta). Firebase then keeps its own sign-in in the
  page's storage, so unlike cloud save's Google token it survives a reload and does not ask again. If that storage
  is not available (a private window), it falls back to memory and asks once per visit.
- **Live views.** The Friends tab listens to each friend's profile and status while it is open; the list and the
  Social dot use one listener on your requests and your friend list. Nothing listens while Friends is off.
- **Offline.** The game never waits on Firebase. When it cannot reach Firebase, the Friends tab says so and shows
  the last thing it saw; writes wait and go out when the connection is back.
- **Versions.** Profiles carry `v`. A friend's newer item or class the older game does not know is still shown from
  the item's own saved copy, or as "Update the game to see this".
- **Co-op later** adds rooms in the Realtime Database next to `status`, using the same sign-in, friend list and
  presence. Nothing in this design has to change for it.
- The **test panel** (`src/fbtest.js`) and its `spike` rules are removed when this is built.

## 5. Privacy, deletion, testing, rollout (to review)

- **Privacy page** gets a Friends section: what is stored (the profile fields above, the friend list, requests and
  online status), where (Google Firebase: Jakarta and Singapore), who can see it (only accepted friends; as the
  project owner the developer can also open the database), and how to delete it. The "no accounts, no server"
  lines on the privacy page, the About page and in the game change to say Friends is the one optional exception.
  The date at the top moves. The `openid` scope is added to the consent screen's scope list in Google Cloud.
- **Deleting.**
  - **Turning Friends off** deletes everything *about* you: your profile, status, `see` list and the requests you
    sent. What stays is only the friendships themselves (two ids and a date on each side) and your code (which
    points to your id and nothing else), so turning Friends on again restores your friends. While it is off,
    friends see you as "Friends turned off".
  - **Delete my Friends data** also removes your code and every friendship, on both sides.
  - Removing the game's access in your Google Account stops everything; data left behind by an uninstalled game is
    covered by the privacy page's contact line.
- **Testing.**
  - `sim/friends.js`, run by `build.py` like `sim/cloudsync.js`, against an in-memory fake of both databases: the
    profile built from a save (hidden characters left out, gear copied), codes, the request → accept → remove flow,
    the once-a-minute write gathering, and the `see` list repair.
  - The security rules are tested against Firebase's local emulator (`firebase emulators:exec`, Java 17 is already
    installed for the Android build): strangers cannot read a profile, cannot add themselves to a list without a
    request, cannot list codes or write someone else's status.
  - On devices: web (Vivaldi and Chrome) and the Android app, two Google accounts, before any beta.
- **Rollout.** A beta first, with both the web `/beta/` page and the app. The rules are published from the repo
  files; publishing needs the Firebase CLI signed in as citizens1997 (Faizal signs in himself), or pasting them in
  the console.

## Open questions

- Should the friend code be changeable (**New code**, which deletes the old one)? Cheap; proposed yes.
- Should declining a request block that player from asking again? Proposed no for now (they would need your code again anyway).
- Friends across the two factions: proposed yes, since it is a list of people, not an in-game alliance.
