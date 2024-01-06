import { build, emptyDir } from "https://deno.land/x/dnt@0.39.0/mod.ts";
import { VERSION } from "../version.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
    undici: true, // Add support for fetch and other browser APIs
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
    _generatedBy: "dnt@0.39.0",
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
