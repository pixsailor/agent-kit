---
name: tdd
description: Test-driven development loop (red-green-refactor). Write one failing test first, confirm it fails, write the minimum code to pass, then refactor — repeating in small steps. Use when building or changing behavior test-first, or when the user asks for TDD. 触发：用户说"用 TDD""测试驱动""先写测试""红绿重构""测试先行"。
---

# TDD: red → green → refactor

Build behavior test-first, one small step at a time. Never write implementation before a failing test exists.

## Setup
- Detect the project's existing test framework/runner and conventions (look for config + `test/` files). Use it — do not introduce a new one.
- Confirm the single behavior to implement next. If unclear, state your assumed first test and proceed.

## The loop (one behavior per cycle)
1. **Red.** Write the smallest test for the next behavior. Run it. Confirm it fails *for the expected reason* (not a typo/setup error).
2. **Green.** Write the minimum code to make it pass — nothing more. Run; confirm green.
3. **Refactor.** Clean up code and tests while staying green. Run again. No new behavior here.
4. Repeat for the next behavior.

## Rules
- One failing test at a time. Don't batch tests ahead of implementation.
- The implementation must be the simplest thing that passes — no speculative code (see Simplicity).
- Keep each cycle small enough to run quickly.
- Stop when the agreed behavior is covered and all tests are green; summarize what's covered.
