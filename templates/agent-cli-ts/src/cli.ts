#!/usr/bin/env node
import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { CLI_NAME, ExitCode, SCHEMA_VERSION, VERSION, err, exitCodes, ok } from "./contract.js";

type Parsed = {
  command?: string;
  json: boolean;
  verbose: boolean;
  help: boolean;
  version: boolean;
  schema: boolean;
  dryRun: boolean;
  confirm: boolean;
  force: boolean;
  target?: string;
};

class CliError extends Error {
  constructor(
    public readonly exitCode: ExitCode,
    public readonly code: string,
    message: string,
    public readonly detail: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

function usage(): string {
  return `Usage: ${CLI_NAME} <command> [options]

Commands:
  ping                         Return a small success payload.
  write --target <path>        Write an example file when confirmed.

Options:
  --json                       Print machine-readable JSON.
  --schema                     Print command/output schema as JSON.
  --dry-run                    Preview write actions without changing files.
  --confirm                    Confirm a write action.
  --force                      Allow overwrite when target exists.
  --verbose                    Print diagnostics to stderr.
  --help                       Show help.
  --version                    Show version.

Examples:
  ${CLI_NAME} ping --json
  ${CLI_NAME} write --target tmp/out.txt --dry-run --json
  ${CLI_NAME} write --target tmp/out.txt --confirm --json`;
}

function parse(argv: string[]): Parsed {
  const parsed: Parsed = {
    json: false,
    verbose: false,
    help: false,
    version: false,
    schema: false,
    dryRun: false,
    confirm: false,
    force: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") parsed.json = true;
    else if (arg === "--verbose") parsed.verbose = true;
    else if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--version") parsed.version = true;
    else if (arg === "--schema") parsed.schema = true;
    else if (arg === "--dry-run") parsed.dryRun = true;
    else if (arg === "--confirm") parsed.confirm = true;
    else if (arg === "--force") parsed.force = true;
    else if (arg === "--target") {
      const value = argv[++i];
      if (!value || value.startsWith("--")) {
        throw new CliError(ExitCode.Usage, "ERR_USAGE", "--target requires a value", { option: "--target" });
      }
      parsed.target = value;
    } else if (arg.startsWith("--")) {
      throw new CliError(ExitCode.Usage, "ERR_USAGE", `Unknown option: ${arg}`, { option: arg });
    } else if (!parsed.command) {
      parsed.command = arg;
    } else {
      throw new CliError(ExitCode.Usage, "ERR_USAGE", `Unexpected argument: ${arg}`, { argument: arg });
    }
  }

  return parsed;
}

function schema(): Record<string, unknown> {
  return {
    schemaVersion: SCHEMA_VERSION,
    name: CLI_NAME,
    version: VERSION,
    commands: [
      {
        name: "ping",
        description: "Return a small success payload.",
        options: [
          { name: "--json", required: false, type: "boolean" },
          { name: "--verbose", required: false, type: "boolean" },
        ],
      },
      {
        name: "write",
        description: "Write an example file when confirmed.",
        options: [
          { name: "--target", required: true, type: "string" },
          { name: "--dry-run", required: false, type: "boolean" },
          { name: "--confirm", required: false, type: "boolean" },
          { name: "--force", required: false, type: "boolean" },
          { name: "--json", required: false, type: "boolean" },
          { name: "--verbose", required: false, type: "boolean" },
        ],
      },
    ],
    output: {
      success: ok({ message: "pong" }),
      error: err("ERR_EXAMPLE", "Human-readable summary"),
    },
    exitCodes,
  };
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function run(parsed: Parsed): Promise<Record<string, unknown>> {
  if (parsed.help) return { json: ok({ usage: usage() }), human: usage() };
  if (parsed.version) return { json: ok({ version: VERSION }), human: VERSION };
  if (parsed.schema) return { json: schema() };

  if (!parsed.command) {
    throw new CliError(ExitCode.Usage, "ERR_USAGE", "Missing command", {});
  }

  if (parsed.command === "ping") {
    if (parsed.verbose) process.stderr.write("ping: returning success payload\n");
    return { json: ok({ message: "pong" }), human: "pong" };
  }

  if (parsed.command === "write") {
    return { json: await runWrite(parsed), human: `wrote ${parsed.target}` };
  }

  throw new CliError(ExitCode.Usage, "ERR_USAGE", `Unknown command: ${parsed.command}`, { command: parsed.command });
}

async function runWrite(parsed: Parsed): Promise<Record<string, unknown>> {
  if (!parsed.target) {
    throw new CliError(ExitCode.Usage, "ERR_USAGE", "Missing required --target", { option: "--target" });
  }
  if (!parsed.dryRun && !parsed.confirm) {
    throw new CliError(
      ExitCode.UnsafeNeedsConfirmation,
      "ERR_CONFIRM_REQUIRED",
      "Write actions require --dry-run or --confirm",
      { target: parsed.target },
    );
  }

  const targetExists = await exists(parsed.target);
  if (parsed.dryRun) {
    if (parsed.verbose) process.stderr.write(`write: dry-run target=${parsed.target}\n`);
    return ok({ target: parsed.target, wouldWrite: true, exists: targetExists }, { dryRun: true });
  }
  if (targetExists && !parsed.force) {
    throw new CliError(ExitCode.Conflict, "ERR_CONFLICT", "Target already exists; use --force to overwrite", {
      target: parsed.target,
    });
  }

  await mkdir(dirname(parsed.target), { recursive: true });
  await writeFile(parsed.target, "agent-cli-template\n", { flag: "w" });
  if (parsed.verbose) process.stderr.write(`write: wrote target=${parsed.target}\n`);
  return ok({ target: parsed.target, written: true, overwritten: targetExists });
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function fail(error: unknown, json: boolean): number {
  if (error instanceof CliError) {
    if (json) printJson(err(error.code, error.message, error.detail));
    else process.stderr.write(`${error.message}\n`);
    return error.exitCode;
  }
  const message = error instanceof Error ? error.message : String(error);
  if (json) printJson(err("ERR_GENERIC", message));
  else process.stderr.write(`${message}\n`);
  return ExitCode.Generic;
}

async function main(): Promise<number> {
  let parsed: Parsed;
  try {
    parsed = parse(process.argv.slice(2));
    const result = await run(parsed);
    if ("json" in result && (parsed.json || parsed.schema)) {
      printJson(result.json);
    } else if (parsed.json) {
      printJson(ok(result));
    } else {
      process.stdout.write(`${String(result.human ?? "")}\n`);
    }
    return ExitCode.Success;
  } catch (error) {
    const wantsJson = process.argv.includes("--json");
    return fail(error, wantsJson);
  }
}

process.exitCode = await main();
