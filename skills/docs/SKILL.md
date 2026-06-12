---
name: docs
description: Write or update documentation that stays accurate and concise. Grounds every statement in the actual code, matches the existing doc style, and prefers updating existing docs over creating new files. Covers README, API/usage docs, and changelog entries. Use when documenting a feature/module, updating docs after a change, or writing release notes. 触发：用户说"写文档""更新 README""补一下说明""写 changelog""生成接口文档""文档化"。
---

# Docs: accurate, concise documentation

## Rules
- **Ground in code.** Every claim must be verifiable against the actual code/behavior. Never invent APIs, options, or examples — check first.
- **Update, don't proliferate.** Prefer editing the existing doc (README/AGENTS.md/CHANGELOG). Create a new file only if asked or clearly needed.
- **Match existing style.** Follow the doc's current structure, tone, headings, and language (zh/en).
- **Concise.** Document what a reader needs to use/understand it — not a tour. No filler.

## When documenting code
1. Read the actual implementation + signatures; confirm behavior (don't trust names).
2. Cover: what it does, how to use it (minimal runnable example), key options/params, gotchas.
3. Keep examples copy-pasteable and correct — verify imports/paths against the repo.

## Changelog / release notes
- Group by type (Added / Changed / Fixed / Removed); user-facing impact, not internal churn.
- Match the project's existing changelog format (e.g. CHANGELOG.md, UPDATE.md).

## Output
The doc edit itself. Flag anything you couldn't verify against code as an open question instead of guessing.
