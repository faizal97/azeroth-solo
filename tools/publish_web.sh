#!/usr/bin/env bash
# Publish the browser version: puts dist/index.html (run build.py first) on the gh-pages branch, which GitHub Pages
# serves at https://faizal97.github.io/azeroth-solo/. A normal commit and push on that branch, never a force-push.
# Usage: tools/publish_web.sh   (run from the repo root, after build.py)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/dist/index.html"
[ -f "$SRC" ] || { echo "no dist/index.html: run python3 build.py first"; exit 1; }
VER="$(grep -o 'AZ_VERSION *= *"[^"]*"' "$SRC" | head -1 | sed 's/.*"\(.*\)"/\1/')"
URL="$(git -C "$ROOT" remote get-url origin)"
GIT=(git -c credential.helper= -c 'credential.helper=!gh auth git-credential')
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
if "${GIT[@]}" ls-remote --exit-code --heads "$URL" gh-pages >/dev/null 2>&1; then
  "${GIT[@]}" clone --quiet --depth 1 --branch gh-pages "$URL" "$TMP/site"
else
  mkdir "$TMP/site" && git -C "$TMP/site" init --quiet -b gh-pages && git -C "$TMP/site" remote add origin "$URL"
fi
cp "$SRC" "$TMP/site/index.html"
touch "$TMP/site/.nojekyll" # serve the file as it is
cd "$TMP/site"
git add index.html .nojekyll
if git diff --cached --quiet; then echo "web version already up to date (v$VER)"; exit 0; fi
git commit --quiet -m "Web build v$VER"
"${GIT[@]}" push --quiet origin gh-pages
echo "published v$VER to gh-pages"
