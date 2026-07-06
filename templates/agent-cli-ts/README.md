# agent-cli-ts template

TypeScript + Node template for agent-first CLIs.

Runtime dependencies: none. Dev dependency: `typescript`.

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

Build output goes to `dist/`. Do not commit `dist`; treat it as generated output.

## Usage

```bash
node dist/cli.js --help
node dist/cli.js --version
node dist/cli.js --schema
node dist/cli.js ping --json
node dist/cli.js write --target tmp/out.txt --dry-run --json
node dist/cli.js write --target tmp/out.txt --confirm --json
```

## JSON Output

Success:

```json
{ "schemaVersion": "1", "ok": true, "code": "OK", "data": {} }
```

Error:

```json
{ "schemaVersion": "1", "ok": false, "code": "ERR_USAGE", "message": "Summary", "detail": {} }
```

Write dry-run includes `"dryRun": true` and does not write files.

## Exit Codes

| Exit | Meaning |
|------|---------|
| 0 | success |
| 1 | generic error |
| 2 | usage / invalid arguments |
| 7 | conflict / already exists |
| 8 | unsafe action requires confirmation |

## Safety

`write` never writes unless `--confirm` is passed. Existing targets are not overwritten unless `--force` is passed. Use `--dry-run --json` to preview without writing.

## Validation

```bash
npm test
npm run validate
```

`npm run validate` calls `../../bin/agent-cli-validate`; that path works inside `agent-kit`. After copying this template elsewhere, update the script or install/call the validator another way.

## Copy/Rename Guide

After copying this template:

1. Change `package.json` `name` and `bin`.
2. Change `CLI_NAME` and `VERSION` in `src/contract.ts`.
3. Replace `ping` / `write` with real commands.
4. Update `--schema`, exit codes, tests, and this README.
5. Update the `validate` script path if the copied project cannot reach `../../bin/agent-cli-validate`.
