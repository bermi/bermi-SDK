import lotrSdk, { LotrSdk } from "../mod.ts";

const help = `Usage: lotr-sdk <command> [options]

Commands:

  help               Show this help message
  allMovieQuotes     movie_id [options] Prints all quotes for a movie. Eg: lotr-sdk allMovieQuotes 5cd95395de30eff6ebccde5b
  allMovies          Prints all movies
  getMovie           movie_id Gets a movie by id. Eg: lotr-sdk getMovie 5cd95395de30eff6ebccde5b
  listMovieQuotes    movie_id [options] Prints a list of quotes for a movie. Eg: lotr-sdk listMovieQuotes 5cd95395de30eff6ebccde5b --limit 5
  listMovies         [options] Prints a list of movies. Eg: lotr-sdk listMovies --limit 5

Options:

  --limit      The number of results to return
  --offset     The number of results to skip
  --page       The page number to return
  --sort       The sort options for the request

`;

// This function returns an array with the arguments for the function
// and a final object with the options (those that start with --)
const getArgs = (args: string[]) => {
  const fnArgs = [];
  const options: Record<string, string | number | boolean> = {};
  while (args.length > 0) {
    const arg = args.shift() || "";
    if (arg.startsWith("-")) {
      const key = arg.replace(/^--?([^ ]+)/, "$1");
      const value = args.shift() || true;
      options[key] = isNaN(Number(value)) ? value : Number(value);
    } else if (Object.keys(options).length === 0) {
      fnArgs.push(arg);
    }
  }
  return [...fnArgs, options];
};

const runCommand = async (
  sdk: LotrSdk.LotrSdk,
  command: string,
  args: unknown[],
) => {
  try {
    // deno-lint-ignore no-explicit-any
    const fn = (sdk as any)[command];
    if (command.startsWith("all")) {
      // This is an async iterator
      for await (const item of fn(...args)) {
        Deno.stdout.writeSync(
          new TextEncoder().encode(`${JSON.stringify(item)}\n`),
        );
      }
    } else {
      for (const item of (await fn(...args)).docs) {
        Deno.stdout.writeSync(
          new TextEncoder().encode(`${JSON.stringify(item)}\n`),
        );
      }
    }
  } catch (error) {
    Deno.stderr.writeSync(
      new TextEncoder().encode(
        `Failed to run command: ${command} with error: `,
      ),
    );
    Deno.stderr.writeSync(new TextEncoder().encode(`${error.message}\n`));
    Deno.exit(1);
  }
};

export const cli = async () => {
  const lotr: LotrSdk.LotrSdk = lotrSdk();
  // If the first argument is --target, then we are running
  // from a deno build.
  const argOffset = Deno.args[0] === "--target" ? 2 : 0;
  const cmd = Deno.args[argOffset] || "help";
  const args = getArgs(Deno.args.slice(argOffset + 1));

  const legalMethods = ["help", ...Object.keys(lotr).sort()];
  if (!legalMethods.includes(cmd)) {
    Deno.stderr.writeSync(
      new TextEncoder().encode(
        `Unknown command: ${cmd}. Legal commands are: ${
          legalMethods.join(", ")
        }`,
      ),
    );
    Deno.exit(1);
  }

  const options = args[args.length - 1] || { help: true, h: true };
  if (
    cmd === "help" ||
    (typeof options !== "string" && (options.help || options.h))
  ) {
    console.log(help);
    Deno.exit(0);
  }

  await runCommand(lotr, cmd, args);
};
