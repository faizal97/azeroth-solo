#!/bin/bash
# Export a cutscene from the real build to an MP4 (1080 px wide, 30 fps, with its music).
# Usage: art/promo/export_cutscene.sh <chapterId> <out.mp4> [endcard.png]
#   chapterId  any id from src/cutscene.js (e.g. legend_lyveus, ch6, brd_intro); run python3 build.py first
#   endcard    optional 1080 px wide image shown for 4.5 s at the end (same size as the frames)
# Serves dist/ on :8777 (its own server, stopped afterwards), records with record_cutscene.js on virtual time,
# trims the tail, fades out, and loops the chapter's music track under it.
set -euo pipefail
CH="$1"; OUT="$2"; END="${3:-}"
R="$(cd "$(dirname "$0")/../.." && pwd)"
TMP="$(mktemp -d /tmp/azexport-XXXX)"
python3 -m http.server 8777 --bind 127.0.0.1 --directory "$R/dist" >/dev/null 2>&1 & SRV=$!; disown $SRV
trap 'kill $SRV 2>/dev/null; rm -rf "$TMP"' EXIT
sleep 1
node "$R/art/promo/record_cutscene.js" "$CH" "$TMP/rec"
MUSIC=$(node -e "global.window=global; require('$R/src/cutscene.js'); const c=CS.byId('$CH'); console.log((c&&c.music)||'dungeon')")
N=$(ls "$TMP/rec"/f*.jpg | wc -l | tr -d ' '); K=$((N-22))
CUT=$(python3 -c "print(round($K/30,3))"); FO=$(python3 -c "print(round($K/30-0.6,3))")
if [ -n "$END" ]; then
  TOT=$(python3 -c "print(round($K/30+4.5,3))")
  ffmpeg -y -v error -framerate 30 -i "$TMP/rec/f%05d.jpg" -loop 1 -framerate 30 -t 4.5 -i "$END" -stream_loop 5 -i "$R/audio/out/music_$MUSIC.m4a" \
    -filter_complex "[0:v]trim=end_frame=$K,setpts=PTS-STARTPTS,fade=t=out:st=$FO:d=0.6,format=yuv420p[a];[1:v]scale=trunc(iw/2)*2:trunc(ih/2)*2,fade=t=in:st=0:d=0.6,fade=t=out:st=3.6:d=0.9,format=yuv420p[b];[a][b]concat=n=2:v=1:a=0[v];[2:a]atrim=0:$TOT,afade=t=in:st=0:d=1.2,afade=t=out:st=$(python3 -c "print(round($TOT-2.5,3))"):d=2.5,volume=0.85[au]" \
    -map "[v]" -map "[au]" -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -r 30 -c:a aac -b:a 160k -movflags +faststart -shortest "$OUT"
else
  ffmpeg -y -v error -framerate 30 -i "$TMP/rec/f%05d.jpg" -stream_loop 5 -i "$R/audio/out/music_$MUSIC.m4a" \
    -filter_complex "[0:v]trim=end_frame=$K,setpts=PTS-STARTPTS,fade=t=out:st=$FO:d=0.6,format=yuv420p[v];[1:a]atrim=0:$CUT,afade=t=in:st=0:d=1.2,afade=t=out:st=$(python3 -c "print(round($CUT-2.5,3))"):d=2.5,volume=0.85[au]" \
    -map "[v]" -map "[au]" -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -r 30 -c:a aac -b:a 160k -movflags +faststart -shortest "$OUT"
fi
echo "wrote $OUT ($(python3 -c "print(round($K/30,1))") s of cutscene)"
