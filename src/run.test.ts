// import { Options } from "../types.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { run, defaultOptions } from "./run.ts";

Deno.test("run", () => {
  // // Use stubs to override methods
  // const random: Stub<Math> = stub(Math, "random", () => 0.5123);
  // assertEquals(Math.random(), 0.5123);
  // random.restore();

  const result = run();
  assert(result);
  assertEquals(result, defaultOptions);
});
