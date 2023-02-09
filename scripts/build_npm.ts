import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";
import { VERSION } from "../version.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: "dev",
    // timers: true,
    // domException: "dev",
  },
  package: {
    name: "@bermi/lotr-sdk",
    version: VERSION,
    description: "The Lord of the Rings SDK",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/bermi/lotr-sdk.git",
    },
    bugs: {
      url: "https://github.com/bermi/lotr-sdk/issues",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");