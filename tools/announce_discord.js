#!/usr/bin/env node
// Post a GitHub release to the game's Discord through a channel webhook: the release name, its notes, and a link to
// itch.io (browser and Android). Players are sent to itch.io, never to GitHub. No bot runs anywhere; Discord only
// receives one message per release.
// Normal releases go to #patch-notes, betas to #beta-builds (only Beta Testers see it). The webhook URLs live outside the
// repo, in ~/.config/realm-of-loner/discord-webhook and discord-webhook-beta (or the DISCORD_WEBHOOK env var),
// so they can never be committed. Each tag is posted once; the posted tags are kept in ~/.config/realm-of-loner/announced.
// A normal release pings the "Patch Notes" role, a beta the "Beta Testers" role (players opt in to both in Onboarding).
// Usage: node tools/announce_discord.js [tag]          the latest normal release, or that tag
//        node tools/announce_discord.js <tag> --beta   allow a pre-release (posts to #beta-builds)
//        node tools/announce_discord.js [tag] --quiet  post without the role ping
//        node tools/announce_discord.js [tag] --dry    print the message instead of posting it
//        node tools/announce_discord.js [tag] --again  post a tag that was already posted
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const tag = args.find((a) => !a.startsWith('--'));
const DIR = path.join(os.homedir(), '.config', 'realm-of-loner');
const LOG_FILE = path.join(DIR, 'announced');
const ITCH = 'https://starlighthvn.itch.io/realm-of-loner';
const MAX_DESC = 4096; // Discord's limit for an embed description
const PATCH_ROLE = '1555434281520865341'; // the server's "Patch Notes" role (role IDs are not secrets)
const BETA_ROLE = '1555436280542789672'; // the server's "Beta Testers" role

const die = (msg) => { console.error(msg); process.exit(1); };

const rel = JSON.parse(execFileSync('gh', ['release', 'view', ...(tag ? [tag] : []), '--json', 'tagName,name,body,url,isPrerelease,assets'], { encoding: 'utf8' }));
if (rel.isPrerelease && !flag('--beta')) die(`${rel.tagName} is a pre-release; add --beta to post it`);

const posted = fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean) : [];
if (posted.includes(rel.tagName) && !flag('--again') && !flag('--dry')) die(`${rel.tagName} was already posted; add --again to post it again`);

const apk = rel.assets.find((a) => a.name.endsWith('.apk'));
// betas are not on itch.io. A beta post gives both ways in (issue #27): the Android switch, and the browser /beta/ page on
// GitHub Pages, the one GitHub link a post may carry (never the repo, its releases or its issues)
const BETA_PAGE = 'https://faizal97.github.io/realm-of-loner/beta/';
const links = rel.isPrerelease
  ? `**Android:** turn on Settings → Beta updates.\n**Browser:** [play the beta](${BETA_PAGE}). Characters from the itch.io browser version don't carry over to this page.`
  : `[Play on itch.io](${ITCH}): in your browser or on Android`;
if (!apk) console.warn(`warning: ${rel.tagName} has no APK attached (the in-app updater will not see it either)`);

// the notes, cut at a line break when they would not fit next to the links
const foot = '\n\n' + links;
let notes = (rel.body || '').trim();
const room = MAX_DESC - foot.length;
if (notes.length > room) {
  const more = '\n…';
  notes = notes.slice(0, room - more.length);
  notes = notes.slice(0, Math.max(notes.lastIndexOf('\n'), 0)) + more;
}

const role = flag('--quiet') ? null : rel.isPrerelease ? BETA_ROLE : PATCH_ROLE;
const payload = {
  username: 'Realm of Loner',
  content: role ? `<@&${role}> ${rel.tagName} is out` : '',
  allowed_mentions: { parse: [], roles: role ? [role] : [] }, // only that one role, never a mention from the notes
  embeds: [{
    title: (rel.isPrerelease ? 'Beta: ' : '') + (rel.name || rel.tagName).slice(0, 256),
    url: rel.isPrerelease ? BETA_PAGE : ITCH,
    description: notes + foot,
    color: rel.isPrerelease ? 0x6c8ebf : 0xc9a44c,
    footer: { text: rel.isPrerelease ? 'Beta builds: Settings → Beta updates on Android, or the /beta/ page in a browser' : 'Update in game from Settings, or get it on itch.io' },
  }],
};

if (flag('--dry')) { console.log(JSON.stringify(payload, null, 2)); process.exit(0); }

const HOOK_FILE = path.join(DIR, rel.isPrerelease ? 'discord-webhook-beta' : 'discord-webhook');
const hook = (process.env.DISCORD_WEBHOOK || (fs.existsSync(HOOK_FILE) ? fs.readFileSync(HOOK_FILE, 'utf8') : '')).trim();
if (!/^https:\/\/(ptb\.|canary\.)?discord(app)?\.com\/api\/webhooks\//.test(hook)) die(`no Discord webhook: put its URL in ${HOOK_FILE}`);

(async () => {
  const res = await fetch(hook + '?wait=true', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) die(`Discord said ${res.status}: ${await res.text()}`);
  fs.mkdirSync(DIR, { recursive: true });
  if (!posted.includes(rel.tagName)) fs.appendFileSync(LOG_FILE, rel.tagName + '\n');
  console.log(`posted ${rel.tagName} to Discord`);
})();
