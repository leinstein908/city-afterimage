#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="${0:A:h}"
PROJECT_DIR="${SCRIPT_DIR:h:h}"
SLIDES_DIR="$SCRIPT_DIR/slides"
PROFILE_DIR="$SCRIPT_DIR/work/chrome-profile"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE_URL="${1:-http://localhost:3001/video-pitch/}"

if [[ ! -x "$CHROME" ]]; then
  echo "Google Chrome was not found at $CHROME" >&2
  exit 1
fi

mkdir -p "$SLIDES_DIR" "$PROFILE_DIR"

for index in {0..6}; do
  number=$(printf "%02d" $((index + 1)))
  "$CHROME" \
    --headless=new \
    --hide-scrollbars \
    --window-size=1920,1080 \
    --force-device-scale-factor=1 \
    --run-all-compositor-stages-before-draw \
    --virtual-time-budget=1800 \
    --user-data-dir="$PROFILE_DIR" \
    --screenshot="$SLIDES_DIR/slide-$number.png" \
    "$BASE_URL?record=1&slide=$index"
done

echo "Seven 1920×1080 slides written to $SLIDES_DIR"
