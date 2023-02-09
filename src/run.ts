import { Options } from "../types.ts";

export const defaultOptions: Options = {
  key: "value",
};

export const run = (
  options: Options | never = defaultOptions,
) => {
  const optionsWithDefaults = { ...defaultOptions, ...options };
  return optionsWithDefaults;
};
