---
name: adr
description: Record an Architectural Decision Record for a non-obvious, hard-to-reverse decision — capturing context, the decision, alternatives, and consequences. Use when a significant design/tech choice is made and worth preserving. 触发：用户说"记录这个决策""写个 ADR""为什么选这个方案要存档""架构决策记录"。
---

# ADR: record a significant decision

## When to create one (all three must hold)
1. **Hard to reverse** — undoing it later is costly.
2. **Surprising without context** — a future reader will ask "why this?".
3. **Real trade-off** — genuine alternatives existed and were rejected for reasons.
If any is missing, skip it.

## Rules
- Match the project's ADR convention/location (`docs/adr/`, existing ADRs); else create `docs/adr/NNNN-title.md` with the next number.
- **Immutable once Accepted.** Don't rewrite history — to change a decision, write a new ADR and mark the old one `Superseded by NNNN`.
- Ground context in the real code/constraint that forced it.

## Format
```
# NNNN. <decision title>
Status: Accepted | Superseded by NNNN
Date: YYYY-MM-DD

## Context
What forced a decision (problem, constraints).

## Decision
What we chose.

## Alternatives
What else was considered, and why rejected.

## Consequences
Trade-offs accepted; what gets easier/harder.
```
