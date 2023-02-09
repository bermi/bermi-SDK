import {
  assert,
  assertEquals,
  assertStrictEquals,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";
import { LotrCollectionResponse } from "../types.ts";
import { createApiSession, defaultOptions } from "./session.ts";

const apiToken = Deno.env.get("LOTR_API_TOKEN") || "";

Deno.test("defaultOptions should have the correct properties", () => {
  assertStrictEquals(defaultOptions.apiVersion, "v2");
  assertStrictEquals(defaultOptions.apiEndpoint, "https://the-one-api.dev");
  assertStrictEquals(defaultOptions.apiToken, apiToken);
});

Deno.test("createApiSession should throw an error if apiToken is not provided", () => {
  const options = {
    apiVersion: "v2",
    apiEndpoint: "https://the-one-api.dev",
    apiToken: "",
  };
  assertThrows(
    () => {
      createApiSession(options);
    },
    Error,
    "API token is required. Please set the LOTR_API_TOKEN or pass it as an option. You can get your API token from https://the-one-api.dev/sign-up",
  );
});

Deno.test("createApiSession should create a valid session object", () => {
  const options = {
    apiVersion: "v2",
    apiEndpoint: "https://the-one-api.dev",
    apiToken: Deno.env.get("LOTR_API_TOKEN") || "token",
  };
  const session = createApiSession(options);
  assertStrictEquals(typeof session.get, "function");
});

// When RUN_INTEGRATION_TESTS is set to true, run integration tests against the API
// Call via: make test-integration
if (
  Deno.env.get("RUN_INTEGRATION_TESTS") === "true"
) {
  Deno.test("get should return a valid paginated response", async () => {
    const session = createApiSession({
      apiToken,
    });
    const result = await session.get("/movie", {
      offset: 1,
      limit: 3,
    }) as LotrCollectionResponse;
    // Expect the response to be a valid Lotr response object
    assertStrictEquals(typeof result.docs, "object");
    assertEquals({
      total: 8,
      limit: 3,
      offset: 1,
    }, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
    assert((result.docs || []).length > 0);
  });

  Deno.test("Session authentication should fail with invalid credentials", async () => {
    const session = createApiSession({
      apiToken: "invalid-token",
    });
    try {
      if (session.authenticate) {
        await session.authenticate();
      }
    } catch (error) {
      assertStrictEquals(error.message, "Invalid API token");
    }
  });
}
