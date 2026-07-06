import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const cli = ["dist/cli.js"];

async function run(args) {
  try {
    const result = await execFileAsync("node", cli.concat(args), { encoding: "utf8" });
    return { exitCode: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return {
      exitCode: error.code,
      stdout: error.stdout || "",
      stderr: error.stderr || "",
    };
  }
}

async function tempPath(name = "out.txt") {
  const dir = await mkdtemp(join(tmpdir(), "agent-cli-template-"));
  return { dir, file: join(dir, name) };
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

test("--help prints human usage", async () => {
  const result = await run(["--help"]);
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Usage: agent-cli-template/);
});

test("--version prints human version", async () => {
  const result = await run(["--version"]);
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout.trim(), /^\d+\.\d+\.\d+$/);
});

test("--json --help returns usage field", async () => {
  const result = await run(["--json", "--help"]);
  assert.equal(result.exitCode, 0);
  const body = JSON.parse(result.stdout);
  assert.equal(body.ok, true);
  assert.equal(typeof body.data.usage, "string");
});

test("--json --version returns version field", async () => {
  const result = await run(["--json", "--version"]);
  assert.equal(result.exitCode, 0);
  const body = JSON.parse(result.stdout);
  assert.equal(body.ok, true);
  assert.match(body.data.version, /^\d+\.\d+\.\d+$/);
});

test("--schema prints agent-readable schema", async () => {
  const result = await run(["--schema"]);
  assert.equal(result.exitCode, 0);
  const body = JSON.parse(result.stdout);
  assert.equal(body.schemaVersion, "1");
  assert.equal(body.name, "agent-cli-template");
  assert.equal(body.output.success.ok, true);
  assert.equal(body.output.error.ok, false);
  assert.ok(body.commands.some((command) => command.name === "ping"));
  assert.ok(body.commands.some((command) => command.name === "write"));
  assert.equal(body.exitCodes["0"], "success");
  assert.equal(body.exitCodes["8"], "unsafe action requires confirmation");
});

test("unknown command exits 2", async () => {
  const result = await run(["nope", "--json"]);
  assert.equal(result.exitCode, 2);
  const body = JSON.parse(result.stdout);
  assert.equal(body.ok, false);
  assert.equal(body.code, "ERR_USAGE");
});

test("unknown option exits 2", async () => {
  const result = await run(["ping", "--bad", "--json"]);
  assert.equal(result.exitCode, 2);
  const body = JSON.parse(result.stdout);
  assert.equal(body.ok, false);
  assert.equal(body.code, "ERR_USAGE");
});

test("missing required option exits 2", async () => {
  const result = await run(["write", "--confirm", "--json"]);
  assert.equal(result.exitCode, 2);
  const body = JSON.parse(result.stdout);
  assert.equal(body.ok, false);
  assert.equal(body.detail.option, "--target");
});

test("ping --json returns success envelope", async () => {
  const result = await run(["ping", "--json"]);
  assert.equal(result.exitCode, 0);
  const body = JSON.parse(result.stdout);
  assert.equal(body.schemaVersion, "1");
  assert.equal(body.ok, true);
  assert.equal(body.code, "OK");
  assert.equal(body.data.message, "pong");
});

test("ping prints human output", async () => {
  const result = await run(["ping"]);
  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout.trim(), "pong");
});

test("ping --json --verbose keeps stdout pure JSON", async () => {
  const result = await run(["ping", "--json", "--verbose"]);
  assert.equal(result.exitCode, 0);
  assert.equal(JSON.parse(result.stdout).ok, true);
  assert.match(result.stderr, /ping:/);
});

test("write dry-run JSON does not write", async () => {
  const { dir, file } = await tempPath();
  try {
    const result = await run(["write", "--target", file, "--dry-run", "--json"]);
    assert.equal(result.exitCode, 0);
    const body = JSON.parse(result.stdout);
    assert.equal(body.ok, true);
    assert.equal(body.dryRun, true);
    assert.equal(await exists(file), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("write without dry-run or confirm exits 8", async () => {
  const { dir, file } = await tempPath();
  try {
    const result = await run(["write", "--target", file, "--json"]);
    assert.equal(result.exitCode, 8);
    const body = JSON.parse(result.stdout);
    assert.equal(body.code, "ERR_CONFIRM_REQUIRED");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("write with confirm writes file", async () => {
  const { dir, file } = await tempPath();
  try {
    const result = await run(["write", "--target", file, "--confirm", "--json"]);
    assert.equal(result.exitCode, 0);
    assert.equal(await readFile(file, "utf8"), "agent-cli-template\n");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("existing target without force exits 7", async () => {
  const { dir, file } = await tempPath();
  try {
    await run(["write", "--target", file, "--confirm", "--json"]);
    const result = await run(["write", "--target", file, "--confirm", "--json"]);
    assert.equal(result.exitCode, 7);
    const body = JSON.parse(result.stdout);
    assert.equal(body.code, "ERR_CONFLICT");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("existing target with force overwrites", async () => {
  const { dir, file } = await tempPath();
  try {
    await run(["write", "--target", file, "--confirm", "--json"]);
    const result = await run(["write", "--target", file, "--confirm", "--force", "--json"]);
    assert.equal(result.exitCode, 0);
    const body = JSON.parse(result.stdout);
    assert.equal(body.data.overwritten, true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("dry-run on existing target does not overwrite", async () => {
  const { dir, file } = await tempPath();
  try {
    await run(["write", "--target", file, "--confirm", "--json"]);
    const result = await run(["write", "--target", file, "--dry-run", "--json"]);
    assert.equal(result.exitCode, 0);
    const body = JSON.parse(result.stdout);
    assert.equal(body.dryRun, true);
    assert.equal(body.data.exists, true);
    assert.equal(await readFile(file, "utf8"), "agent-cli-template\n");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
