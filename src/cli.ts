import lotrSdk, { LotrSdk } from "../mod.ts";
import { getLogger } from "./logger.ts";

const help = `Usage: lotr-sdk <command> [options]

Commands:

  help               Show this help message
  allMovieQuotes     movie_id [options] Prints all quotes for a movie. Eg: lotr-sdk allMovieQuotes 5cd95395de30eff6ebccde5b
  allMovies          Prints all movies
  authenticate       Check our credentials against the API
  getMovie           movie_id Gets a movie by id. Eg: lotr-sdk getMovie 5cd95395de30eff6ebccde5b
  listMovieQuotes    movie_id [options] Prints a list of quotes for a movie. Eg: lotr-sdk listMovieQuotes 5cd95395de30eff6ebccde5b --limit 5
  listMovies         [options] Prints a list of movies. Eg: lotr-sdk listMovies --limit 5

Options:

  --limit      The number of results to return
  --offset     The number of results to skip
  --page       The page number to return
  --sort       The sort options for the request

`;

/**
 * Get the arguments from the command line and split them into
 * the arguments for the function and the options.
 *
 * @param args
 * @returns An array with the arguments for the function
 *          and the options as an object.
 */
const getArgs = (args: string[]) => {
  // Used to extract the feature from the command line argument.
  // Eg: --limit 5 => {limit: 5} and -h => {h: true]
  const EXTRACT_FEATURE_RE = /^--?([^ ]+)/;
  const fnArgs = [];
  const options: Record<string, string | number | boolean> = {};
  while (args.length > 0) {
    const arg = args.shift() || "";
    if (arg.startsWith("-")) {
      const key = arg.replace(EXTRACT_FEATURE_RE, "$1");
      const value = args.shift() || true;
      options[key] = isNaN(Number(value)) ? value : Number(value);
    } else if (Object.keys(options).length === 0) {
      fnArgs.push(arg);
    }
  }
  return [...fnArgs, options];
};

/**
 * Run the command on the sdk with the given arguments.
 * @param sdk
 * @param command
 * @param args
 */
const runCommand = async (
  sdk: LotrSdk.LotrSdk,
  command: string,
  args: unknown[],
) => {
  const logger = getLogger();
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
      const result = await fn(...args);
      // Log out everything except the docs
      logger.info(
        `CLI: ${JSON.stringify({ ...result, command, docs: undefined })}`,
      );

      for (const item of result.docs) {
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

/**
 * The main entry point for the CLI.
 *
 * On error, the process will exit with a non-zero exit code.
 */
export const cli = async () => {
  const lotr: LotrSdk.LotrSdk = lotrSdk();
  const argsCopy = [...Deno.args];
  // If the first argument is --target, then we are running
  // from a deno build.
  const argOffset = argsCopy[0] === "--target" ? 2 : 0;
  let args = getArgs(argsCopy.slice(argOffset));
  const lastArg = args[args.length - 1] as Record<string, boolean> || {};
  const cmd = (!lastArg.h && !lastArg.help) ? argsCopy[argOffset] : "help";
  if (args[0] === cmd) {
    args = args.slice(1);
  }

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
