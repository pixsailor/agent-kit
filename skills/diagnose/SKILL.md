---
name: diagnose
description: Systematic root-cause analysis for bugs, failures, or unexpected behavior. Gathers evidence (repro, logs, code, recent changes), forms and tests hypotheses, and pins the root cause before any fix. Use when something is broken, failing, flaky, or behaving unexpectedly and the cause is not obvious. 触发：用户说"为什么报错""这个 bug 咋回事""排查一下""定位根因""哪里出问题了""诊断一下"。
---

# Diagnose: find the root cause before fixing

Goal: locate the real cause with evidence. Do NOT patch blindly.

**This session pauses the default "fix forward" stance: investigate first, do not propose or apply any fix until Step 5.**

## Steps
1. **Reproduce.** Establish exact steps + expected vs actual. If you can't reproduce, say what's needed.
2. **Gather evidence.** Read the failing code path, logs, stack traces, and recent diffs (`git log`/`diff` — read-only). State facts, not guesses.
3. **Hypothesize.** List candidate causes, ranked by likelihood given the evidence.
4. **Test hypotheses.** Narrow down with the cheapest discriminating check (a log, a probe, bisect). Eliminate, don't assume.
5. **Pin the root cause.** Confirm with concrete evidence — the line/condition that actually causes it, not a symptom.

## Output
- **Root cause:** one precise statement + the evidence that proves it.
- **Why it happens:** the mechanism.
- **Suggested fix:** the minimal change, and a test that would reproduce/guard it.
- Do not edit code unless explicitly asked — hand off the fix.
