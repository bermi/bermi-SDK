// MIT License
// Copyright (c) 2023 Bermi Ferrer

const inner = {
  // dnt-shim-ignore
  // deno-lint-ignore no-explicit-any
  isNode: (globalThis as any).process?.versions?.node != null,
  // dnt-shim-ignore
  // deno-lint-ignore no-explicit-any
  isDeno: (globalThis as any).Deno?.version?.deno != null,
};

export const isNode = inner.isNode && !inner.isDeno;
export const isDeno = inner.isDeno && !isNode;

export * as LotrSdk from "./types.ts";
export { VERSION } from "./version.ts";
import { cli } from "./src/cli.ts";
import lotrSdk from "./src/sdk.ts";

export default lotrSdk;

// Run the cli if called directly
// deno-lint-ignore no-explicit-any
if (isDeno && (import.meta as any || {}).main) {
  cli().then(() => Deno.exit(0));
}
