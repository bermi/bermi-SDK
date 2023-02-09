import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";
import { VERSION } from "../version.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  // scriptMode: true,
  shims: {
    deno: "dev",
    undici: true, // Add support for fetch and other browser APIs
    // timers: true,
    // domException: "dev",
  },
  package: {
    name: "@bermi/lotr-sdk",
    version: VERSION,
    description: "The Lord of the Rings SDK",
    license: "MIT",
    engines: {
      node: ">=18.0.0",
      npm: ">=9.4.0",
    },
    repository: {
      type: "git",
      url: "git+https://github.com/bermi/bermi-SDK.git",
    },
    bugs: {
      url: "https://github.com/bermi/bermi-SDK/issues",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
