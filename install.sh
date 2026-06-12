#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<EOF
Usage: ./install.sh [--project <path>] [--dry-run]

  --project <path>   Install into <path>/.cursor (default: global ~/.cursor)
  --dry-run          Print actions without making changes
EOF
}

TARGET_BASE="${HOME}/.cursor"
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) TARGET_BASE="$(cd "$2" && pwd)/.cursor"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown arg: $1"; usage; exit 1 ;;
  esac
done

run() { if [[ $DRY_RUN -eq 1 ]]; then echo "[dry-run] $*"; else "$@"; fi; }

link() {  # link <src> <dst>
  local src="$1" dst="$2"
  if [[ -e "$dst" && ! -L "$dst" ]]; then
    echo "skip (real path exists, not a symlink): $dst"; return
  fi
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "[dry-run] would link: $dst -> $src"
  else
    ln -sfn "$src" "$dst"
    echo "linked: $dst -> $src"
  fi
}

run mkdir -p "$TARGET_BASE/rules" "$TARGET_BASE/skills"

for f in "$REPO"/rules/*.mdc; do
  [[ -e "$f" ]] && link "$f" "$TARGET_BASE/rules/$(basename "$f")"
done

for d in "$REPO"/skills/*/; do
  [[ -d "$d" ]] && link "${d%/}" "$TARGET_BASE/skills/$(basename "$d")"
done

echo "Done. Target: $TARGET_BASE"
