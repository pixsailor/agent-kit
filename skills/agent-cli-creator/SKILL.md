---
name: agent-cli-creator
description: >
  Create agent-first CLI tools, defaulting to TypeScript/Node: CLIs that agents can
  install, discover, call non-interactively, parse as JSON, and recover from with stable
  exit codes. Use when creating or extending CLI tools for agents or automation.
  触发词："创建 agent CLI"、"给 agent 用的 CLI"、"agent-cli"、"自动化 CLI"、"机器可读 CLI"。
---

# Agent CLI Creator

Create CLIs for AI agents, not just humans.

## Trigger

Use when the CLI is for agents, automation, CI, machine parsing, stable JSON, or non-interactive tool calls.

Do not use for one-off shell commands, GUI apps, API-only tools, or human-only CLIs.

Priority:

1. Explicit agent/automation intent wins.
2. JSON, stable exit codes, CI/tool invocation, or non-interactive use count as automation signals.
3. If ambiguous, ask whether it must be agent-callable.

## Goal

An agent can locate, run, parse, fail safely, and recover without reading source.

Default: TypeScript + Node. Override only with repo evidence or user choice.

## Gates

Do not implement until each gate is explicit or `N/A`.

| Gate | Rule |
|------|------|
| Scope | `project-local`, `user-global`, or `portable`; default `portable` for reusable toolkits |
| Language | default TS/Node |
| Install | install/update/uninstall + PATH/symlink/wrapper behavior |
| Discovery | no network, prompt, browser, package download, or login |
| Invocation | non-interactive; `--help`, `--version`, `--json` |
| JSON | stable envelope with `schemaVersion` |
| Exit codes | document every non-zero code used |
| Safety | destructive actions need confirmation |
| Evolution | define schema/command/option/exit-code change rules |
| `--schema` | required for complex CLIs; optional for trivial documented CLIs |

Ask one question at a time only when code cannot answer. Skipping a gate requires a reason.

Conflicts:

- Safety > convenience.
- Existing repo conventions > new patterns unless they block agent use.
- Discovery reliability > install convenience.
- Stable JSON/exit codes > human-friendly output.
- Project-local > global when PATH ownership is unclear.
- User choice / strong repo stack > TS default.
- Backward compatibility > cleanup unless user approves breaking change.

## MVP

For simple read-only CLIs:

- Required: scope, language, discovery, non-interactive call, `--help`, `--version`, `--json`, JSON envelope, exit `0/1/2`, docs, tests.
- May defer: `--dry-run`, `--confirm`, `--force`, `--schema`, full exit table, install automation.
- Never defer: stdout/stderr split, documented invocation, no prompts, no unsafe defaults.

## Inspect

Read before choosing:

- `package.json`, `tsconfig.json`, test configs
- `pyproject.toml`, `go.mod`, `Cargo.toml`, `Makefile`
- `bin/`, `cli/`, `cmd/`, `scripts/`, `tools/`
- install scripts, tests, docs, logging/error/JSON style

## Contracts

### Scope

Choose:

- `project-local`: path/script invocation.
- `user-global`: installed into PATH.
- `portable`: source in repo; installer exposes it. Default for reusable toolkits.

Record `scope`, `sourceLocation`, `primaryInvocation`, `fallbackInvocation`.

### Language

Default:

```yaml
language: TypeScript
runtime: Node.js
packageManager: npm|pnpm|yarn
moduleSystem: ESM|CJS
minNodeVersion: ">=20"
```

Use bash only for thin wrappers; Go/Rust for single binary/no Node; Python for Python-native repos.

### Install/Discovery

Define idempotency, ownership, overwrite behavior.

Defaults: no overwrite; update only owned files/symlinks; unknown ownership fails; writes support `--dry-run`.

Allowed discovery:

```bash
command -v <name>
<name> --version
<name> --help
test -x ./bin/<name>
node ./bin/<name> --help
```

No `npx` for discovery.

### Invocation

Required when relevant: `--help`, `--version`, `--json`, `--dry-run`, `--verbose|--debug`, `--confirm|--force`.

Rules: stdout=result, stderr=diagnostics, prompts only with `--interactive`, config priority flags > env > config > defaults.

### JSON/Schema

JSON success:

```json
{ "schemaVersion": "1", "ok": true, "code": "OK", "data": {} }
```

JSON error:

```json
{ "schemaVersion": "1", "ok": false, "code": "ERR_EXAMPLE", "message": "Summary", "detail": {} }
```

Write dry-run:

```json
{ "schemaVersion": "1", "ok": true, "code": "OK", "dryRun": true, "data": {} }
```

Rules: `--json` stdout JSON only; warnings to stderr or `warnings`; JSON `code` agrees with exit code.

Compatibility: add optional field/error code = compatible. Delete/rename/change type or meaning/base envelope = breaking; bump schema major.

`--schema` for complex CLIs outputs JSON only:

```json
{
  "schemaVersion": "1",
  "name": "<cli>",
  "version": "<version>",
  "commands": [
    { "name": "cmd", "options": [], "subcommands": [] }
  ],
  "output": {
    "success": { "schemaVersion": "1", "ok": true, "code": "OK", "data": {} },
    "error": { "schemaVersion": "1", "ok": false, "code": "ERR", "message": "", "detail": {} }
  },
  "exitCodes": { "0": "success", "2": "usage / invalid arguments" }
}
```

`subcommands` is recursive. Leaf commands map to executable invocations. `data` must describe real shape.

### Exit Codes

Baseline: `0` success, `1` generic, `2` usage, `3` config, `4` missing dependency, `5` permission, `6` not found, `7` conflict, `8` unsafe needs confirmation, `9` external command failed, `10` network/timeout.

Never reuse meanings; append only; document every non-zero code used.

### Safety/Evolution

Safety: destructive actions require target + `--confirm|--force`; writes support `--dry-run`; overwrite off by default; secrets never printed; credentials via env/config; idempotent where practical.

Evolution: schema starts `"1"`; breaking output bumps major; command renames keep alias/migration note; option removals need deprecation; exit meanings immutable; README examples are contract.

## Implementation

Prefer repo style. For TS: follow ESM/CJS convention, keep typed IO, central `ExitCode`/JSON/error mapping, process IO at boundary, logic testable without spawning.

## Verify

Minimum tests: help, version, JSON success/error, invalid args -> 2, conflict -> 7 if writes, dry-run JSON no-write if writes, destructive no-confirm -> 8 if destructive, schema if supported, JSON fixture/schema check.

Docs update for command/options/env/config/install/discovery/JSON/exit/safety/platform/runtime changes. Docs include Install, Discovery, Usage, JSON Output, Exit Codes, Safety, Examples.

Run or provide:

```bash
<install-check>
<discovery-check>
<name> --help
<name> --version
<name> --json <success>
<name> --json <error>
<name> --dry-run --json <write>
<test-command>
<typecheck-command>
```

Report scope, language, install/discovery/invocation, platforms, schema version, exit codes, files changed.

## Success

Done means an agent can locate the CLI, run it without prompts, parse JSON stdout, rely on exit codes, avoid unsafe writes, and recover from documented errors.
