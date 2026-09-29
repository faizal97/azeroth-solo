#!/usr/bin/env python3
"""Inline fonts, CSS and JS into one offline HTML file, and copy it into the Android app."""
import os, shutil
R = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(R, p), encoding='utf-8').read()
import base64, json, glob, sys, subprocess
# the data must check out before anything is built
if subprocess.run(['node', os.path.join(R, 'tools', 'validate.js')]).returncode != 0:
    sys.exit('build stopped: fix the data errors above')
# and the story must agree with the lore bible (docs/lore/canon.md): no spoilers, no stray names
if subprocess.run(['node', os.path.join(R, 'tools', 'lorekeeper.js')]).returncode != 0:
    sys.exit('build stopped: fix the lore problems above (see docs/lore/canon.md)')
# v10: no name from the old world (tools/rename_v10.json) may appear in anything a player reads (the fan notice excepted)
if subprocess.run(['node', os.path.join(R, 'tools', 'ipcheck.js'), '--brief', '--enforce']).returncode != 0:
    sys.exit('build stopped: an old-world name is back in player text (node tools/ipcheck.js lists where)')
if subprocess.run(['node', os.path.join(R, 'sim', 'cloudsync.js')]).returncode != 0:
    sys.exit('build stopped: a cloud save rule is broken (node sim/cloudsync.js lists which)')
if subprocess.run(['node', os.path.join(R, 'sim', 'friends.js')]).returncode != 0:
    sys.exit('build stopped: a Friends rule is broken (node sim/friends.js lists which)')
DATA = ['src/data/' + f for f in json.load(open(os.path.join(R, 'src', 'data', 'files.json')))]
# music ships only once he has listened and approved the track
APPROVED = set(open(os.path.join(R, 'audio', 'approved.txt')).read().split()) if os.path.exists(os.path.join(R, 'audio', 'approved.txt')) else set()
aud = {}
for f in sorted(glob.glob(os.path.join(R, 'audio', 'out', '*.m4a'))):
    n = os.path.basename(f)[:-4]
    if n == 'sfx_reel': continue
    if n.startswith('music_') and n[6:] not in APPROVED: continue
    aud[n] = 'data:audio/mp4;base64,' + base64.b64encode(open(f, 'rb').read()).decode()
meta = rd('audio/out/music.json') if os.path.exists(os.path.join(R, 'audio/out/music.json')) else '{}'
# the app version, for the in-app updater (src/update.js compares it with the latest GitHub release)
import re
VERSION = re.search(r'^version:\s*([0-9.]+(?:-[0-9A-Za-z.]+)?)', rd('app/pubspec.yaml'), re.M).group(1)  # 9.9.0, or 9.10.0-beta.1
audio_js = f'window.AZ_VERSION={json.dumps(VERSION)};' + 'window.AUDIO_DATA=' + json.dumps(aud) + ';window.AUDIO_META=' + meta + ';'
js = [f for f in ['src/report.js', 'src/art.js', 'src/art_durotar.js', 'src/art_mulgore.js', 'src/art_tirisfal.js', 'src/art_westfall.js', 'src/art_barrens.js', 'src/art_icons2.js', 'src/art_icons3.js', 'src/art_icons4.js', 'src/art_icons5.js', 'src/art_icons6.js', 'src/art_icons7.js', 'src/art_redridge.js', 'src/art_stonetalon.js', 'src/art_duskwood.js', 'src/art_hillsbrad.js', 'src/art_ashenvale.js', 'src/art_wetlands.js', 'src/art_stranglethorn.js', 'src/art_gnomeregan.js', 'src/art_razorfen.js', 'src/art_arathi.js', 'src/art_scarlet.js', 'src/art_mounts.js', 'src/art_icons8.js', 'src/art_tanaris.js', 'src/art_zulfarrak.js', 'src/art_feralas.js', 'src/art_maraudon.js', 'src/art_icons9.js', 'src/art_icons10.js', 'src/art_ungoro.js', 'src/art_steppes.js', 'src/art_brd.js', 'src/art_plaguelands.js', 'src/art_winterspring.js', 'src/art_scholomance.js', 'src/art_stratholme.js', 'src/art_dustwallow.js', 'src/art_moltencore.js', 'src/art_tidewatch.js', 'src/art_skullreef.js', 'src/art_archive.js', 'src/art_shalzua.js', 'src/art_tidecrown.js', 'src/art_story.js', 'src/art_story2.js', 'src/art_legends.js'] + DATA + ['src/engine.js', 'src/bots.js', 'src/game.js', 'src/social.js', 'src/sound.js', 'src/cutscene.js', 'src/update.js', 'src/cloud.js', 'src/friends.js', 'src/savefile.js', 'src/ui.js'] if os.path.exists(os.path.join(R, f))]
html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0e0b08">
<title>Realm of Loner</title>
<link rel="icon" type="image/png" href="data:image/png;base64,{base64.b64encode(open(os.path.join(R, 'src', 'favicon.png'), 'rb').read()).decode()}">
<link rel="apple-touch-icon" href="data:image/png;base64,{base64.b64encode(open(os.path.join(R, 'src', 'favicon.png'), 'rb').read()).decode()}">
<style>{rd('fonts/fonts.local.css')}</style>
<style>{rd('src/style.css')}</style>
</head><body><div id="app"></div>
<script>{audio_js}</script>
{''.join('<script>' + rd(f) + '</script>' for f in js)}
</body></html>'''
os.makedirs(os.path.join(R, 'dist'), exist_ok=True)
out = os.path.join(R, 'dist', 'index.html')
open(out, 'w', encoding='utf-8').write(html)
dst = os.path.join(R, 'app', 'assets', 'game', 'index.html')
if subprocess.run(['node', os.path.join(R, 'tools', 'ipcheck.js'), '--dist', out]).returncode != 0:
    sys.exit('build stopped: an old-world name is in the built page, maybe in a comment (listed above)')
shutil.copy(out, dst)
print('built', out, 'v' + VERSION, round(len(html) / 1024), 'KB;', 'art.js' if 'src/art.js' in js else 'NO ART (placeholders)', '; audio files:', len(aud))
