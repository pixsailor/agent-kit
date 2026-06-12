#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<EOF
Usage: ./uninstall.sh [--project <path>] [--dry-run]

  --project <path>   Uninstall from <path>/.cursor (default: global ~/.cursor)
  --dry-run          Print actions without making changes

Only removes symlinks that point back into this repo. Real files are left untouched.
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

unlink_if_ours() {  # unlink_if_ours <dst>
  local dst="$1"
  [[ -L "$dst" ]] || return 0
  local tgt; tgt="$(readlink "$dst")"
  case "$tgt" in
    "$REPO"/*)
      if [[ $DRY_RUN -eq 1 ]]; then
        echo "[dry-run] would remove: $dst"
      else
        rm "$dst"; echo "removed: $dst"
      fi
      ;;
    *) echo "skip (not ours): $dst -> $tgt" ;;
  esac
}

for f in "$REPO"/rules/*.mdc; do
  [[ -e "$f" ]] && unlink_if_ours "$TARGET_BASE/rules/$(basename "$f")"
done

for d in "$REPO"/skills/*/; do
  [[ -d "$d" ]] && unlink_if_ours "$TARGET_BASE/skills/$(basename "$d")"
done

echo "Done. Target: $TARGET_BASE"
