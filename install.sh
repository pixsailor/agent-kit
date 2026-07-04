#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$REPO/rules/behavior.md"
MARKER="agent-kit:managed"
ALL_TARGETS="cursor codex claude gemini windsurf cline roo"

usage() {
  cat <<EOF
Usage: ./install.sh [--target <list>] [--components <list>] [--project <path>] [--dry-run]

  --target <list>      Comma-separated from: cursor,codex,claude,gemini,windsurf,cline,roo,all
                       (default: all)
  --components <list>  Comma-separated from: rules,skills,all  (default: all)
  --project <path>     Install at project level under <path> (default: global home dirs)
  --dry-run            Print actions without making changes

Single source of truth: rules/behavior.md
  - cursor : generated .mdc (frontmatter + body) — RE-RUN install after editing the source
  - others : symlinked — edits to the source take effect immediately
Skills (skills/*/) are symlinked into each target's skills dir (roo has none).
EOF
}

TARGETS="$ALL_TARGETS"
COMPONENTS="rules skills"
PROJECT=""
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) TARGETS="${2//,/ }"; shift 2 ;;
    --components) COMPONENTS="${2//,/ }"; shift 2 ;;
    --project) PROJECT="$(cd "$2" && pwd)"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown arg: $1"; usage; exit 1 ;;
  esac
done
case " $TARGETS " in *" all "*) TARGETS="$ALL_TARGETS" ;; esac
case " $COMPONENTS " in *" all "*) COMPONENTS="rules skills" ;; esac

cursor_frontmatter() {
  cat <<'EOF'
---
description: Global coding-agent baseline — autonomous, terse, minimal-diff, self-verifying, with hard safety limits on destructive and git-write actions.
alwaysApply: true
---
EOF
}

dest_for() {  # dest_for <target>
  if [[ -n "$PROJECT" ]]; then
    case "$1" in
      cursor)   echo "$PROJECT/.cursor/rules/behavior.mdc" ;;
      codex)    echo "$PROJECT/AGENTS.md" ;;
      claude)   echo "$PROJECT/CLAUDE.md" ;;
      gemini)   echo "$PROJECT/GEMINI.md" ;;
      windsurf) echo "$PROJECT/.windsurf/rules/behavior.md" ;;
      cline)    echo "$PROJECT/.clinerules/behavior.md" ;;
      roo)      echo "$PROJECT/.roo/rules/behavior.md" ;;
    esac
  else
    case "$1" in
      cursor)   echo "$HOME/.cursor/rules/behavior.mdc" ;;
      codex)    echo "$HOME/.codex/AGENTS.md" ;;
      claude)   echo "$HOME/.claude/CLAUDE.md" ;;
      gemini)   echo "$HOME/.gemini/GEMINI.md" ;;
      windsurf) echo "$HOME/.codeium/windsurf/memories/global_rules.md" ;;
      cline)    echo "$HOME/Documents/Cline/Rules/behavior.md" ;;
      roo)      echo "$HOME/.roo/rules/behavior.md" ;;
    esac
  fi
}

skills_dir() {  # skills_dir <target>; empty output = no skills for this target
  if [[ -n "$PROJECT" ]]; then
    case "$1" in
      cursor)   echo "$PROJECT/.cursor/skills" ;;
      claude)   echo "$PROJECT/.claude/skills" ;;
      codex)    echo "$PROJECT/.agents/skills" ;;
      gemini)   echo "$PROJECT/.gemini/skills" ;;
      windsurf) echo "$PROJECT/.windsurf/skills" ;;
      cline)    echo "$PROJECT/.cline/skills" ;;
      *)        echo "" ;;
    esac
  else
    case "$1" in
      cursor)   echo "$HOME/.cursor/skills" ;;
      claude)   echo "$HOME/.claude/skills" ;;
      codex)    echo "$HOME/.agents/skills" ;;
      gemini)   echo "$HOME/.gemini/skills" ;;
      windsurf) echo "$HOME/.codeium/windsurf/skills" ;;
      cline)    echo "$HOME/.cline/skills" ;;
      *)        echo "" ;;
    esac
  fi
}

ensure_dir() {
  local d="$1"
  [[ -d "$d" ]] && return 0
  if [[ $DRY_RUN -eq 1 ]]; then echo "[dry-run] mkdir -p $d"; else mkdir -p "$d"; fi
}

symlink() {  # symlink <src> <dst>
  local src="$1" dst="$2"
  if [[ -e "$dst" && ! -L "$dst" ]]; then
    echo "skip (real path exists, not a symlink): $dst"; return
  fi
  ensure_dir "$(dirname "$dst")"
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "[dry-run] would link: $dst -> $src"
  else
    ln -sfn "$src" "$dst"; echo "linked: $dst -> $src"
  fi
}

generate_codex() {  # generate_codex <dst>; generate/update managed block, preserve user content
  local dst="$1"
  local start_m="<!-- agent-kit:managed: start -->"
  local end_m="<!-- agent-kit:managed: end -->"

  # Handle existing symlink (old install)
  if [[ -L "$dst" ]]; then
    local tgt; tgt="$(readlink "$dst")"
    case "$tgt" in
      "$REPO"/*) if [[ $DRY_RUN -eq 1 ]]; then echo "[dry-run] would remove old symlink: $dst"
                 else rm "$dst"; echo "removed old symlink: $dst"; fi ;;
      *)         echo "skip (symlink not ours): $dst -> $tgt"; return ;;
    esac
  fi

  ensure_dir "$(dirname "$dst")"

  local managed_block
  managed_block="$(printf '%s\n<!-- generated from agent-kit/rules/behavior.md; re-run install.sh to update -->\n\n' "$start_m"; cat "$SRC"; printf '\n\n%s\n' "$end_m")"

  if [[ $DRY_RUN -eq 1 ]]; then echo "[dry-run] would generate (codex): $dst"; return; fi

  if [[ ! -e "$dst" ]]; then
    printf '%s' "$managed_block" > "$dst"; echo "generated: $dst"
  elif grep -qF "$start_m" "$dst" 2>/dev/null; then
    # Update only the managed block; keep user content above it
    local user_part
    user_part="$(awk '/agent-kit:managed: start/{exit} {print}' "$dst" \
      | awk '{lines[NR]=$0} NF{last=NR} END{for(i=1;i<=last;i++) print lines[i]}')"
    if [[ -n "$user_part" ]]; then printf '%s\n\n%s' "$user_part" "$managed_block" > "$dst"
    else printf '%s' "$managed_block" > "$dst"; fi
    echo "updated managed block: $dst"
  else
    # Real file, no marker — preserve existing content, append managed block
    local existing; existing="$(cat "$dst")"
    printf '%s\n\n%s' "$existing" "$managed_block" > "$dst"
    echo "appended managed block: $dst"
  fi
}

generate_cursor() {  # generate_cursor <dst>
  local dst="$1"
  if [[ -e "$dst" && ! -L "$dst" ]] && ! grep -q "$MARKER" "$dst" 2>/dev/null; then
    echo "skip (real file exists, not managed by agent-kit): $dst"; return
  fi
  ensure_dir "$(dirname "$dst")"
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "[dry-run] would generate: $dst (frontmatter + behavior.md)"
  else
    [[ -L "$dst" ]] && rm "$dst"
    { cursor_frontmatter; printf '\n<!-- %s: generated from agent-kit/rules/behavior.md; re-run install.sh after editing the source -->\n\n' "$MARKER"; cat "$SRC"; } > "$dst"
    echo "generated: $dst"
  fi
}

for t in $TARGETS; do
  dst="$(dest_for "$t")"
  sd="$(skills_dir "$t")"
  if [[ -z "$dst" && -z "$sd" ]]; then echo "unknown target: $t (skipped)"; continue; fi

  if [[ " $COMPONENTS " == *" rules "* ]]; then
    if [[ -z "$dst" ]]; then
      echo "no rule dest for target: $t (skipped rules)"
    elif [[ "$t" == "cursor" ]]; then
      generate_cursor "$dst"
    elif [[ "$t" == "codex" ]]; then
      generate_codex "$dst"
    else
      symlink "$SRC" "$dst"
    fi
  fi

  if [[ " $COMPONENTS " == *" skills "* && -n "$sd" ]]; then
    for d in "$REPO"/skills/*/; do
      [[ -d "$d" ]] && symlink "${d%/}" "$sd/$(basename "$d")"
    done
  fi
done

echo "Done. Targets: $TARGETS | components: ${COMPONENTS// /,}${PROJECT:+ (project: $PROJECT)}"
