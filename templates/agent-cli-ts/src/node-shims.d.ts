declare const process: {
  argv: string[];
  exitCode?: number;
  stdout: { write(value: string): void };
  stderr: { write(value: string): void };
};

declare module "node:fs/promises" {
  export function access(path: string): Promise<void>;
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  export function writeFile(path: string, data: string, options?: { flag?: string }): Promise<void>;
}

declare module "node:path" {
  export function dirname(path: string): string;
}
