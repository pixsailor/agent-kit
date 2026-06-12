---
name: commit
description: Create a well-formed git commit (and optionally a PR). Reviews staged/unstaged changes, writes a conventional, why-focused message, and commits only what's relevant. Use when the user explicitly asks to commit, or to prepare a PR. 触发：用户说"提交""commit""提个 PR""帮我 push""生成提交信息"。
---

# Commit: clean, conventional commits

Only run when the user explicitly asks to commit. Never commit unprompted.

## Steps
1. **Inspect.** `git status` + `git diff` (read-only) to see all staged/unstaged changes.
2. **Match style.** Skim recent `git log` to follow this repo's message convention.
3. **Stage deliberately.** Add only files relevant to this change. Never stage secrets (`.env`, keys, credentials) — warn if the user asks to.
4. **Write the message.**
   - Conventional format: `type(scope): summary` (feat/fix/docs/refactor/test/chore...).
   - Summary in imperative, ≤72 chars. Body explains **why**, not what.
5. **Commit** via heredoc to preserve formatting. Then `git status` to confirm.

## Rules
- One logical change per commit; split unrelated changes.
- Don't amend pushed commits; don't force-push; don't touch git config or hooks unless asked.
- If a pre-commit hook fails, fix the issue and make a NEW commit (don't blindly --amend).
- Push (when asked): `git fetch` first; ensure the branch has an upstream (`-u` on first push). Prefer fast-forward — if behind, integrate (rebase or merge, per repo habit) before pushing. A routine feature-branch fast-forward needs only the normal confirmation.
- PR (only if asked): push branch, then open PR with a summary + test plan.
