import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const cli = ["bin/agent-cli-validate"];

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

test("--json keeps help output machine-readable", async () => {
  const result = await run(["--json", "--help"]);

  assert.equal(result.exitCode, 0);
  const body = JSON.parse(result.stdout);
  assert.equal(body.schemaVersion, "1");
  assert.equal(body.ok, true);
  assert.equal(body.code, "OK");
  assert.equal(typeof body.data.usage, "string");
});

test("--json keeps version output machine-readable", async () => {
  const result = await run(["--json", "--version"]);

  assert.equal(result.exitCode, 0);
  const body = JSON.parse(result.stdout);
  assert.equal(body.schemaVersion, "1");
  assert.equal(body.ok, true);
  assert.equal(body.code, "OK");
  assert.match(body.data.version, /^\d+\.\d+\.\d+$/);
});

test("schema validation rejects non-object output data/detail", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agent-cli-bad-schema-"));
  const cliPath = join(dir, "bad-schema.mjs");
  await writeFile(cliPath, `#!/usr/bin/env node
if (process.argv.includes("--help") || process.argv.includes("--version")) process.exit(0);
if (process.argv.includes("--schema")) {
  console.log(JSON.stringify({
    schemaVersion: "1",
    name: "bad-schema",
    commands: [],
    output: {
      success: { schemaVersion: "1", ok: true, code: "OK", data: "bad" },
      error: { schemaVersion: "1", ok: false, code: "ERR", message: "bad", detail: "bad" }
    },
    exitCodes: { 0: "success" }
  }));
  process.exit(0);
}
if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ schemaVersion: "1", ok: false, code: "ERR_USAGE", message: "bad", detail: {} }));
  process.exit(2);
}
`);

  try {
    const result = await run(["--cmd", `node ${cliPath}`, "--schema-required", "--json"]);
    assert.equal(result.exitCode, 1);
    const body = JSON.parse(result.stdout);
    assert.equal(body.ok, false);
    assert.equal(body.code, "ERR_VALIDATION_FAILED");
    assert.match(body.detail.checks.find((check) => check.name === "schema").message, /object data/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("json output validation reports malformed envelope message", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agent-cli-bad-json-"));
  const cliPath = join(dir, "bad-json.mjs");
  await writeFile(cliPath, `#!/usr/bin/env node
if (process.argv.includes("--help") || process.argv.includes("--version")) process.exit(0);
if (process.argv.includes("--schema")) {
  console.log(JSON.stringify({
    schemaVersion: "1",
    name: "bad-json",
    commands: [],
    output: {
      success: { schemaVersion: "1", ok: true, code: "OK", data: {} },
      error: { schemaVersion: "1", ok: false, code: "ERR", message: "bad", detail: {} }
    },
    exitCodes: { 0: "success", 2: "usage" }
  }));
  process.exit(0);
}
if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ schemaVersion: "1", ok: true, code: "OK", data: "bad" }));
  process.exit(0);
}
`);

  try {
    const result = await run(["--cmd", `node ${cliPath}`, "--success-args", "ok", "--json"]);
    assert.equal(result.exitCode, 1);
    const body = JSON.parse(result.stdout);
    const check = body.detail.checks.find((item) => item.name === "json-success");
    assert.equal(check.status, "fail");
    assert.match(check.message, /object data/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("timeout returns even when child ignores SIGTERM", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agent-cli-timeout-"));
  const cliPath = join(dir, "ignore-term.mjs");
  const pidPath = join(dir, "pid.txt");
  await writeFile(cliPath, `#!/usr/bin/env node
import { writeFileSync } from "node:fs";
writeFileSync(${JSON.stringify(pidPath)}, String(process.pid));
process.on("SIGTERM", () => {});
setInterval(() => {}, 1000);
`);

  try {
    const start = Date.now();
    const result = await run(["--cmd", `node ${cliPath}`, "--timeout", "300", "--json"]);
    assert.equal(result.exitCode, 1);
    assert.ok(Date.now() - start < 2500);
    const body = JSON.parse(result.stdout);
    const help = body.detail.checks.find((check) => check.name === "help");
    assert.equal(help.status, "fail");
    assert.match(help.message, /timed out/);
    const childPid = Number(await readFile(pidPath, "utf8"));
    await sleep(500);
    assert.equal(isProcessAlive(childPid), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error && error.code === "ESRCH") return false;
    throw error;
  }
}
