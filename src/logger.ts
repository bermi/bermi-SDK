import type { Logger } from "../types.ts";

/**
 * Simple logger that logs to the console when the DEBUG environment variable is set to true.
 */
const log = (
  message: string,
  method: "log" | "error" | "info" | "warn" = "log",
) => {
  console[method](message); // eslint-disable-line no-console
};

export const getLogger = (): Logger => {
  const debug = Deno.env.get("DEBUG") === "true";

  if (debug) {
    return {
      debug: (message: string) => log(message, "log"),
      error: (message: string) => log(message, "error"),
      info: (message: string) => log(message, "info"),
      warn: (message: string) => log(message, "warn"),
    };
  } else {
    return {
      debug: () => {},
      error: () => {},
      info: () => {},
      warn: () => {},
    };
  }
};
