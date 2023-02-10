# LOTR SDK prototype Design document

## Introduction

This document describes the design of the LOTR SDK prototype. A utility to
interact with the LOTR API REST service hosted at <https://the-one-api.dev>.

The requirement for this prototype is only to cover the following movie
endpoints:

- /movie
- /movie/{id}
- /movie/{id}/quote

The main goal of this prototype is to explore how to allow users to access
details about The Lord of the Rings movies and quotes from the LOTR API using a
simple and easy-to-use SDK.

## Technology

This project uses the
[Deno runtime](https://deno.land/manual@v1.30.3/getting_started/installation) to
develop, document, test, lint, format, and build the SDK.

Deno provides a great developer experience out of the box. It allows developers
to write TypeScript code that can run in the browser, in Node.js, and on
sandboxed standalone executables.

By using Deno we can:

- Provide a simple and easy-to-use SDK for the LOTR API.
- Allow the code to be used in as many environments as possible.
- Built-in documentation for types and methods (`deno doc types.ts`).
- Release dependency-free single binary CLI versions of the SDK for Windows,
  MacOS and Linux.
- Enforce formatting and linting rules using `deno fmt` and `deno lint`.
- Leverage the
  [secure-by-default design of Deno](https://deno.land/manual@v1.28.3/basics/permissions)
  to avoid common security vulnerabilities.

### fetch vs axios/node-fetch/superagent

The Deno runtime provides a `fetch` API compatible with the browser
[`fetch` API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

Given the limited scope of this prototype and the fact that the LOTR API uses
non-standar URL parameters there was no benefit in using a third-party library
to make HTTP requests for this prototype. However, caching and retry mechanisms
can warrant using a third-party library.

## Architecture

The code is structured as follows:

```
./mod.ts // Used by Deno to expose ./src/sdk.ts
./types.ts // Type and interface definitions
./src/
  ./session.ts // Explained below
  ./movie.ts // Movie module
  ./quote.ts // Quote module
  ./sdk.ts // Entry point for the SDK
  ./cli.ts // CLI main entry point
```

The SDK uses a Session instance to store the API key and the base URL of the API
as well as other settings, such as timeouts.

The session will be passed to the Movie and Quote modules as a dependency. This
allows simple mocking of the session for testing purposes.

From a user perspective, the SDK will be used as follows:

```typescript
import lotrSdk, {
  LotrSdk,
  Movie,
  MoviesResponse,
  PaginationOptions,
  Quote,
  QuotesResponse,
} from "https://deno.land/x/lotr/mod.ts";

const lotr: LotrSdk = lotrSdk({ apiToken: "l1bl4b" });

// Authenticate the session
await lotr.authenticate();

// For list methods, the pagination options can be passed as the last argument
const options: PaginationOptions = { limit: 2, offset: 0, page: 1 };

// Get a list of movies
const movies: Movie[] = await lotr.listMovies(); // => { docs: [{ _id: "123", name: "The Fellowship of the Ring" }], ... }

// Get a movie by id
const movie: MoviesResponse = await lotr.getMovie("123"); // => { _id: "123", name: "The Fellowship of the Ring" }

// Get a list of quotes for a movie
const quotes: QuotesResponse = await lotr.listMovieQuotes("123"); // => { docs: [{ _id: "456", character: "789", dialog: "You shall not pass!" }], ... }
```

### Authentication

The LOTR API uses a simple API key to authenticate requests. The API key is
passed in the `Authorization` header as a Bearer token.

The SDK will provide a `authenticate` method that will be called automatically
if the session is not authenticated. This method will store the token in the
session and will be used for all subsequent requests. The token can be provided
through the `apiToken` option when creating the session or by setting the
`LOTR_LOTR_API_TOKEN` environment variable.

Supporting other authentication mechanisms, such as a file or a third-party
secret manager can be added when needed without breaking the API interface.

### Pagination

The LOTR API uses a simple pagination mechanism to return a list of results.

At this time, the parameters required by the SDK are the same as the ones
required by the API.

The `allMovies` and `allMovieQuotes` methods use an
[async generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator)
to return all the results for a given query. This allows the user to iterate
over the results without having to worry about pagination.

```typescript
for await (const movie of lotr.allMovies()) {
  console.log({ movie });
}
```

### Caching

We use the
[`fetch` API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to
make requests to the API. The `fetch` API is a low-level API that does not
provide any caching mechanism.

We can explore using the
[`Cache` API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) in the
future to provide caching capabilities.

The `src/sdk.ts` file creates a closure for each SDK instance that can be used
for memoization. Given the write-once read-many nature of the LOTR data set, a
global LRU cache across instances would improve latency by reducing network
calls to the originating API.

### Rate limiting

The LOTR API is rate limited to 100 requests per 10 minutes. The SDK will throw
a `RateLimitError` if the API returns a 429 status code. No retry mechanism is
implemented on this prototype.

## Discussion

The `listMovieQuotes` method returns the primary key for the character. Right
now given the limited scope of the API, this doesn't represent an issue but as
soon as we expose the `/character` endpoint, users of the SDK could benefit from
optional memoization to avoid making unnecessary requests (n+1 queries).

The API is rate limited to 100 requests per 10 minutes. The SDK should provide a
way to inspect the headers X-RateLimit-Limit, X-RateLimit-Remaining, and
X-RateLimit-Reset and retry the request after the rate limit. Choosing an
existing library such as axios or superagent would allow us to avoid having to
implement this logic ourselves, but it would also add a dependency to the SDK
with luggage that we don't need and increase the bundle size.

The API supports conditional requests using the `If-None-Match` header. Right
now the SDK does not support this feature, but it could be added in the future
by adding a `cache` option to the session that would be used to store the ETag.

An OpenAPI specification for the API could be used to validate the API responses
and automatically generate the TypeScript interfaces and source code when adding
new entities.

Other missing features include logging, observability (OpenTelemetry), older
versions of node.js and npm, and API response validation.

## Conclusion

The LOTR API is a simple REST API that doesn't require a lot of complexity to be
interacted with, a simple fetch method would suffice to cover most use cases;
however, an SDK can be a great tool to help developers to simplify testing,
observability, error handling, and performance tuning.

The SDK will improve its value proposition as more methods are added to the API.
