/** `prepublish` will be invoked before publish, return `false` to prevent the publish. */
export async function prepublish(version: string) {
  const readme = await Deno.readTextFile("./README.md");

  // We'll update the version number shown on the docs
  await Deno.writeTextFile(
    "./README.md",
    readme.replace(
      /\/\/deno\.land\/x\/lotr-sdk@v[\d\.]+\//,
      `//deno.land/x/lotr-sdk@v${version}/`,
    ),
  );
}

/** `postpublish` will be invoked after published. */
export function postpublish(version: string) {
  console.log("Upgraded to", version);
}
