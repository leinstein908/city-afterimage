#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="${0:A:h}"
AUDIO_DIR="$SCRIPT_DIR/audio"

if ! command -v say >/dev/null 2>&1; then
  echo "This helper uses the macOS 'say' command with the Samantha voice." >&2
  exit 1
fi

mkdir -p "$AUDIO_DIR"

say -v Samantha -r 180 -o "$AUDIO_DIR/scene-01.aiff" -- "Moving to an unfamiliar city looks like a housing search. But what you repeat every day isn't a listing. It's an ordinary day."
say -v Samantha -r 180 -o "$AUDIO_DIR/scene-02.aiff" -- "Most tools ask about rent, commute, and bedrooms. They miss what makes daily life work: if work ends at seven thirty, can you still eat, unwind, meet a friend, or reach a park?"
say -v Samantha -r 180 -o "$AUDIO_DIR/scene-03.aiff" -- "City Afterimage is a relocation agent. Users set work, commute, and who and what they want nearby, then choose between real-life scenes. Before showing a place name, it turns those choices into a lifestyle profile."
say -v Samantha -r 180 -o "$AUDIO_DIR/scene-04.aiff" -- "That order matters. First, users check whether the profile feels true, and can remove or change anything that doesn't. Then the agent connects it to Wuhan coordinates, routes, nearby facilities, and twenty-two curated neighborhood clusters."
say -v Samantha -r 180 -o "$AUDIO_DIR/scene-05.aiff" -- "It returns three choices: best overall fit, least daily friction, and a feasible step toward the life they want. Each includes an evidence passport with sources, a clear trade-off, and a simulated weekday and weekend."
say -v Samantha -r 180 -o "$AUDIO_DIR/scene-06.aiff" -- "The user can push back. Tighten the commute limit from forty to thirty-five minutes, or reject one piece of evidence. The recommendation, its evidence, and the simulated day all update together."
say -v Samantha -r 205 -o "$AUDIO_DIR/scene-07.aiff" -- "For one mover, City Afterimage combines the work of a local guide, relocation agent, and data analyst. It never claims one perfect home."

echo "English narration written to $AUDIO_DIR"
