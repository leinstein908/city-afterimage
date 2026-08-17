#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="${0:A:h}"
PROJECT_DIR="${SCRIPT_DIR:h:h}"
SLIDES_DIR="$SCRIPT_DIR/slides"
CAPTIONS_DIR="$SCRIPT_DIR/captions"
AUDIO_DIR="$SCRIPT_DIR/audio"
WORK_DIR="$SCRIPT_DIR/work"
OUTPUT="$PROJECT_DIR/public/video-pitch/city-afterimage-openarena-90s.mp4"

mkdir -p "$WORK_DIR" "$CAPTIONS_DIR"

node "$SCRIPT_DIR/render-caption-assets.mjs"

ffmpeg -hide_banner -loglevel error -stats -y \
  -loop 1 -framerate 30 -t 10.4 -i "$SLIDES_DIR/slide-01.png" \
  -loop 1 -framerate 30 -t 12.4 -i "$SLIDES_DIR/slide-02.png" \
  -loop 1 -framerate 30 -t 14.4 -i "$SLIDES_DIR/slide-03.png" \
  -loop 1 -framerate 30 -t 16.4 -i "$SLIDES_DIR/slide-04.png" \
  -loop 1 -framerate 30 -t 17.4 -i "$SLIDES_DIR/slide-05.png" \
  -loop 1 -framerate 30 -t 13.4 -i "$SLIDES_DIR/slide-06.png" \
  -loop 1 -framerate 30 -t 8.0 -i "$SLIDES_DIR/slide-07.png" \
  -filter_complex "\
    [0:v]scale=1920:1080,fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v0];\
    [1:v]scale=1920:1080,fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v1];\
    [2:v]scale=1920:1080,fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v2];\
    [3:v]scale=1920:1080,fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v3];\
    [4:v]scale=1920:1080,fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v4];\
    [5:v]scale=1920:1080,fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v5];\
    [6:v]scale=1920:1080,fps=30,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v6];\
    [v0][v1]xfade=transition=smoothleft:duration=0.4:offset=10.0[x1];\
    [x1][v2]xfade=transition=fade:duration=0.4:offset=22.0[x2];\
    [x2][v3]xfade=transition=smoothup:duration=0.4:offset=36.0[x3];\
    [x3][v4]xfade=transition=fade:duration=0.4:offset=52.0[x4];\
    [x4][v5]xfade=transition=smoothleft:duration=0.4:offset=69.0[x5];\
    [x5][v6]xfade=transition=fade:duration=0.4:offset=82.0[outv]" \
  -map "[outv]" \
  -an -t 90 \
  -c:v libx264 -preset fast -crf 12 -pix_fmt yuv420p -r 30 \
  "$WORK_DIR/visual.mp4"

ffmpeg -hide_banner -loglevel error -stats -y \
  -i "$AUDIO_DIR/scene-01.aiff" \
  -i "$AUDIO_DIR/scene-02.aiff" \
  -i "$AUDIO_DIR/scene-03.aiff" \
  -i "$AUDIO_DIR/scene-04.aiff" \
  -i "$AUDIO_DIR/scene-05.aiff" \
  -i "$AUDIO_DIR/scene-06.aiff" \
  -i "$AUDIO_DIR/scene-07.aiff" \
  -filter_complex "\
    [0:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,adelay=200|200[a0];\
    [1:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,adelay=10200|10200[a1];\
    [2:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,adelay=22200|22200[a2];\
    [3:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,adelay=36200|36200[a3];\
    [4:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,adelay=52200|52200[a4];\
    [5:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,adelay=69200|69200[a5];\
    [6:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,adelay=82200|82200[a6];\
    [a0][a1][a2][a3][a4][a5][a6]amix=inputs=7:duration=longest:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad=whole_dur=90,atrim=duration=90[outa]" \
  -map "[outa]" \
  -ar 48000 -ac 2 -c:a pcm_s16le \
  "$WORK_DIR/narration.wav"

node "$SCRIPT_DIR/assemble-final.mjs"
