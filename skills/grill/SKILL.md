---
name: grill
description: Pre-solve interrogation. Relentlessly questions the plan one item at a time, explores the codebase to self-answer where possible, sharpens vague terms, and surfaces contradictions — until there is a shared, verifiable understanding before any code is written. Use when the user wants to align on a plan / requirements before building, or says "grill me". 触发：用户说"对齐需求""动手前先想清楚""帮我捋一下方案""审一下这个计划""grill"。
---

# Grill: align before you build

When invoked, do NOT start coding. Run an interrogation until we share a precise understanding of the goal.

## Rules of the session
- **One question at a time.** Wait for the answer before the next. No question dumps.
- **For each question, give your recommended answer** (so the user can just confirm).
- **Explore before asking.** If the codebase can answer it, go read the code — don't ask.
- **Walk the design tree.** Resolve dependencies between decisions in order; don't jump around.
- **Stop when aligned.** End the session once the goal is verifiable and no major unknowns remain — then summarize the agreed plan.

## What to probe
- **Vague / overloaded terms** → propose one precise canonical term. ("'account' = Customer or User? They differ.")
- **Hidden assumptions** → name them, ask to confirm.
- **Edge cases & boundaries** → invent concrete scenarios that force precision.
- **Contradictions with code** → if a claim conflicts with what the code does, surface it. ("Code cancels whole orders, but you said partial — which?")
- **Success criteria** → pin down how we'll verify "done" (test, output, behavior).

## Output
End with a short, agreed **plan + explicit success criteria**. No ADR/glossary files unless the user asks.
