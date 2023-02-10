import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import {
  LotrCollectionResponse,
  LotrDocumentResponse,
  LotrSdk,
  Movie,
  SdkSession,
} from "../types.ts";
import { getLogger } from "./logger.ts";
import lotrSdk from "./sdk.ts";

let page = 0;
const mockPaginationSession = (
  serverResponse: Array<LotrCollectionResponse | LotrDocumentResponse>,
): SdkSession<LotrCollectionResponse | LotrDocumentResponse> => {
  page = 0;
  return {
    get() {
      return new Promise((resolve) => {
        if (serverResponse.length === 0) {
          resolve({ docs: [], total: 0, limit: 0, offset: 0 });
        } else {
          resolve(serverResponse[page]);
          page++;
        }
      }) as Promise<LotrCollectionResponse | LotrDocumentResponse>;
    },
    logger: getLogger(),
  };
};

const firstMovie: Movie = {
  _id: "5cd95395de30eff6ebccde59",
  name: "The Desolation of Smaug",
  runtimeInMinutes: 161,
  budgetInMillions: 217,
  boxOfficeRevenueInMillions: 958.4,
  academyAwardNominations: 3,
  academyAwardWins: 0,
  rottenTomatoesScore: 75,
};

const secondMovie: Movie = {
  _id: "5cd95395de30eff6ebccde58",
  name: "The Unexpected Journey",
  runtimeInMinutes: 169,
  budgetInMillions: 200,
  boxOfficeRevenueInMillions: 1021,
  academyAwardNominations: 3,
  academyAwardWins: 1,
  rottenTomatoesScore: 64,
};

const moviesPageOne: LotrCollectionResponse = {
  docs: [firstMovie],
  total: 2,
  limit: 1,
  offset: 1,
};
const moviesPageTwo: LotrCollectionResponse = {
  docs: [secondMovie],
  total: 2,
  limit: 1,
  offset: 2,
};

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

Deno.test("allMovies async iterator", async () => {
  const lotr: LotrSdk = lotrSdk(
    {
      apiToken: "l1bl4b",
      session: mockPaginationSession([
        moviesPageOne,
        moviesPageTwo,
      ]),
    },
  );
  const movies = new Set();
  for await (const movie of lotr.allMovies({ limit: 1 })) {
    movies.add(movie);
  }
  assertEquals(movies.size, 2);
  assertEquals(movies.has(firstMovie), true);
  assertEquals(movies.has(secondMovie), true);
});
