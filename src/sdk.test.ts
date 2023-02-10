import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { LotrSdk } from "../types.ts";
import lotrSdk from "./sdk.ts";

Deno.test("should expose public API methods", () => {
  const lotr: LotrSdk = lotrSdk({ apiToken: "l1bl4b" });
  const methods = Object.keys(lotr).sort();
  const expected = [
    // "allMovieQuotes",
    "allMovies",
    "authenticate",
    "getMovie",
    "listMovieQuotes",
    "listMovies",
  ].sort();
  assertEquals(methods, expected);
});
