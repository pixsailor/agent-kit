---
name: propose
description: Turn a goal into an ordered, confirmable plan that sequences this kit's other skills. Clarifies intent, maps each step to the right skill (explore/diagnose/tdd/review/commit/docs/...), and waits for approval before executing. Use ONLY when the user explicitly asks to plan/orchestrate the work. 触发：用户说"@propose""制定执行计划""分几步做""统筹一下怎么推进""帮我把这事拆成步骤"。
---

# Propose: turn a goal into a skill-sequenced plan

Trigger only on explicit request. Don't auto-engage even on vague or multi-step asks — let the user opt in. This is the orchestration layer — its job is to pick and sequence other skills, not to redo their work.

**This session pauses the default "act by default" stance: no writes until the plan is confirmed.** Read-only recon is fine.

## Steps
1. **Understand intent.** Goal, scope (files/modules), constraints. Ask only if you genuinely can't infer.
2. **Map to skills.** Match each part of the work to the right skill — e.g. `explore` to orient, `diagnose` for a bug, `tdd` to build, `review` before merge, `commit` to land, `docs`/`adr`/`retro` to follow up. Use a plain step where no skill fits.
3. **Sequence.** Order the steps; each = one independently-runnable skill call (or a plain action). Don't unfold a skill's internal steps — e.g. keep `tdd`'s red-green-refactor inside `tdd`, not three plan steps. Note skill, expected output, dependencies.
4. **Confirm.** Let the user add/cut/reorder; execute step by step only after approval, invoking each skill in turn.

## Output
- **Goal:** one line.
- **Plan:** numbered steps, each = action + skill + expected result.
- **Open questions / risks:** anything blocking or assumed.
Keep it tight — a route to act on, not a document. For pure requirement-grilling use `grill`; for native read-only planning use your tool's plan mode.
