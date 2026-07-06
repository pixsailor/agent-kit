export const CLI_NAME = "agent-cli-template";
export const VERSION = "0.1.0";
export const SCHEMA_VERSION = "1";

export const enum ExitCode {
  Success = 0,
  Generic = 1,
  Usage = 2,
  Conflict = 7,
  UnsafeNeedsConfirmation = 8,
}

export type JsonSuccess = {
  schemaVersion: string;
  ok: true;
  code: "OK";
  data: Record<string, unknown>;
  dryRun?: true;
  warnings?: string[];
};

export type JsonError = {
  schemaVersion: string;
  ok: false;
  code: string;
  message: string;
  detail: Record<string, unknown>;
};

export function ok(data: Record<string, unknown>, options: { dryRun?: boolean } = {}): JsonSuccess {
  const body: JsonSuccess = { schemaVersion: SCHEMA_VERSION, ok: true, code: "OK", data };
  if (options.dryRun) body.dryRun = true;
  return body;
}

export function err(code: string, message: string, detail: Record<string, unknown> = {}): JsonError {
  return { schemaVersion: SCHEMA_VERSION, ok: false, code, message, detail };
}

export const exitCodes = {
  0: "success",
  1: "generic error",
  2: "usage / invalid arguments",
  7: "conflict / already exists",
  8: "unsafe action requires confirmation",
};
