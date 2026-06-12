---
name: review
description: Structured, read-only code review. Examines a diff or set of files for correctness, security, performance, and maintainability, and reports findings ranked by severity (Blocker/Major/Minor/Nit) with file:line references. Use when the user wants their changes, a PR, or specific files reviewed before merging. 触发：用户说"审一下代码""帮我 review""看看这个 PR 有没有问题""合并前检查""代码审查"。
---

# Review: structured code review

Read-only. Report findings; do not edit code unless explicitly asked.

## Scope
- Default to the change set: staged/unstaged diff or the named PR/files (`git diff`, `git log` — read-only).
- Review against the project's own conventions first (AGENTS.md, .cursor rules, existing style) — not generic dogma.

## What to check
- **Correctness:** logic errors, edge cases, off-by-one, null/undefined, error handling, race conditions.
- **Security:** input validation, injection, secrets, unsafe deserialization, authz gaps.
- **Performance:** needless allocations/loops, N+1, blocking work on hot paths.
- **Maintainability:** clarity, dead code, duplication, naming, over-engineering vs the request.
- **Tests:** are the changes covered? do tests assert behavior, not implementation?

## Output
Group findings by severity, each with `file:line`, the problem, and a concrete suggested fix:
- **Blocker** — must fix before merge (bugs, security, breakage).
- **Major** — should fix (design/perf/missing tests).
- **Minor** — worth fixing (clarity, small risks).
- **Nit** — optional (style, naming).

End with a one-line verdict: ready to merge / needs changes, and the top 1–3 priorities.
