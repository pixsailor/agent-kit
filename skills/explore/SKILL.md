---
name: explore
description: Quickly build an accurate mental model of an unfamiliar codebase, module, or feature. Maps entry points, key files, data flow, and conventions, then reports a concise orientation. Read-only. Use when starting work in an unfamiliar repo/area or when the user asks "how does X work / where is Y". 触发：用户说"这块代码怎么跑的""X 在哪实现的""带我熟悉下这个项目""理一下结构""这个模块是干嘛的"。
---

# Explore: orient fast in unfamiliar code

Read-only. Goal: understand enough to act, without changing anything.

## Steps
1. **Frame the question.** What are we trying to understand or change? State it in one line.
2. **Map the terrain.** Find entry points and structure (README/AGENTS.md, package.json scripts, dir layout, config).
3. **Trace the path.** Follow the relevant flow end to end — who calls what, where data enters/exits, key types/abstractions.
4. **Note conventions.** Test setup, build, naming, existing patterns to follow.
5. **Find the edit points.** Identify the specific files/lines a change would touch, and risks/unknowns.

## Output
- **What it does** + **how it's structured** (a few lines, not a tour).
- **Key files** with `path:line` and one-line role each.
- **Flow:** A -> B -> C for the relevant path.
- **To change X:** the touch points + open questions.
Be concise — orientation, not documentation.
