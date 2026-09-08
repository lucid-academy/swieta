#!/usr/bin/env bash
# Fragment muzyki pod intro z magnesami.
#
#   bash tools/muzyka-intro.sh ~/Desktop/Iron_Horizon.mp3
#
# Wycina 4,00-32,50 s utworu do dzwiek/intro.m4a i dzwiek/intro.mp3.
#
# Skąd te sekundy: w 4,08 s utwór wchodzi twardo (RMS skacze z -20 na
# -10 dB), a w 32,1 s sekcja się urywa i robi się cicho. Intro jest
# zestrojone z tym drugim punktem — finał 2026 staje na środku kadru
# dokładnie wtedy, gdy muzyka milknie, i ostatnie 1,3 s magnes stoi w ciszy.
#
# Dwa formaty, bo AAC jest o połowę lżejszy, a MP3 nie odmówi nigdzie.
set -euo pipefail

ZRODLO="${1:?podaj ścieżkę do pliku z utworem}"
WYJSCIE="$(dirname "$0")/../dzwiek"
mkdir -p "$WYJSCIE"

OD=4.0
ILE=28.5
# Fade-in 30 ms tylko po to, żeby nie strzeliło w głośniku — uderzenie
# w 4,08 s zostaje nietknięte. Fade-out już w cichym ogonie po urwaniu.
FILTR="afade=t=in:st=0:d=0.03,afade=t=out:st=27.9:d=0.6"

ffmpeg -hide_banner -v error -y -ss "$OD" -t "$ILE" -i "$ZRODLO" \
  -af "$FILTR" -c:a aac -b:a 96k -movflags +faststart "$WYJSCIE/intro.m4a"

ffmpeg -hide_banner -v error -y -ss "$OD" -t "$ILE" -i "$ZRODLO" \
  -af "$FILTR" -c:a libmp3lame -b:a 112k "$WYJSCIE/intro.mp3"

ls -lh "$WYJSCIE"
