#!/usr/bin/env bash
# Renders art/logo/brand.html (the lantern over the name, in the game's own title font) with headless Chrome to
# art/logo/brand_512.png, and the 120 px copy Google's sign-in screen asks for, art/logo/brand_120.png.
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
# headless Chrome sometimes stays open after writing the screenshot, so it gets 30 s
timeout 30 "$CHROME" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$TMP/profile" --allow-file-access-from-files \
  --window-size=512,512 --virtual-time-budget=3000 --screenshot="$D/brand_512.png" "file://$D/brand.html" >/dev/null 2>&1 || true
[ -s "$D/brand_512.png" ] || { echo "no screenshot"; exit 1; }
sips -z 120 120 "$D/brand_512.png" --out "$D/brand_120.png" >/dev/null
echo "brand logo rendered: art/logo/brand_512.png, art/logo/brand_120.png"
