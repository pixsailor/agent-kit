#!/usr/bin/env bash
# Validate every skills/*/SKILL.md has a well-formed frontmatter:
#   - opens and closes with '---'
#   - has a 'name:' equal to its directory
#   - has a 'description:' that mentions a trigger (触发 / 触发词)
# Exit non-zero if any problem is found. Run before committing a new/edited skill.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
errors=0
checked=0

shopt -s nullglob
skills=("$REPO"/skills/*/SKILL.md)
shopt -u nullglob
if [[ ${#skills[@]} -eq 0 ]]; then
  echo "no skills found under skills/*/SKILL.md"; exit 1
fi

for f in "${skills[@]}"; do
  dir="$(basename "$(dirname "$f")")"
  rel="skills/$dir/SKILL.md"
  checked=$((checked + 1))

  if [[ "$(sed -n '1p' "$f")" != "---" ]]; then
    echo "FAIL $rel: missing opening '---' frontmatter"
    errors=$((errors + 1)); continue
  fi

  close="$(awk 'NR>1 && /^---[[:space:]]*$/ {print NR; exit}' "$f")"
  if [[ -z "$close" ]]; then
    echo "FAIL $rel: frontmatter not closed with '---'"
    errors=$((errors + 1)); continue
  fi
  fm="$(sed -n "1,${close}p" "$f")"

  name="$(printf '%s\n' "$fm" | sed -n 's/^name:[[:space:]]*//p' | head -1 | tr -d '[:space:]\r')"
  if [[ -z "$name" ]]; then
    echo "FAIL $rel: missing 'name:'"; errors=$((errors + 1))
  elif [[ "$name" != "$dir" ]]; then
    echo "FAIL $rel: name '$name' != directory '$dir'"; errors=$((errors + 1))
  fi

  if ! printf '%s\n' "$fm" | grep -q '^description:'; then
    echo "FAIL $rel: missing 'description:'"; errors=$((errors + 1))
  fi

  if ! printf '%s\n' "$fm" | grep -q '触发'; then
    echo "FAIL $rel: description missing trigger hint (触发…)"; errors=$((errors + 1))
  fi
done

if [[ $errors -gt 0 ]]; then
  echo "✗ $errors problem(s) across $checked skill(s)."
  exit 1
fi
echo "✓ all $checked skills valid."
