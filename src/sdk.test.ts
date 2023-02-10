import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import {
  LotrCollectionResponse,
  LotrDocumentResponse,
  LotrSdk,
  Movie,
  Quote,
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

const firstQuote: Quote = {
  _id: "5cd96e05de30eff6ebcced19",
  dialog: "They think we have the Ring.",
  movie: "5cd95395de30eff6ebccde5b",
  character: "5cd99d4bde30eff6ebccfe2e",
};

const secondQuote: Quote = {
  _id: "5cd96e05de30eff6ebcced1a",
  dialog: "Ssh!As soon as they find out we don'twe're dead.",
  movie: "5cd95395de30eff6ebccde5b",
  character: "5cd99d4bde30eff6ebccfc7c",
};

const movieQuotesPageOne: LotrCollectionResponse = {
  docs: [firstQuote],
  total: 2,
  limit: 1,
  offset: 1,
};
const movieQuotesPageTwo: LotrCollectionResponse = {
  docs: [secondQuote],
  total: 2,
  limit: 1,
  offset: 2,
};

Deno.test("should expose public API methods", () => {
  const lotr: LotrSdk = lotrSdk({ apiToken: "l1bl4b" });
  const methods = Object.keys(lotr).sort();
  const expected = [
    "allMovieQuotes",
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

Deno.test("allMovieQuotes async iterator", async () => {
  const lotr: LotrSdk = lotrSdk(
    {
      apiToken: "l1bl4b",
      session: mockPaginationSession([
        movieQuotesPageOne,
        movieQuotesPageTwo,
      ]),
    },
  );
  const quotes = new Set();
  for await (
    const quote of lotr.allMovieQuotes("5cd95395de30eff6ebccde5b", { limit: 1 })
  ) {
    quotes.add(quote.dialog);
  }
  assertEquals(quotes.size, 2);
  assertEquals(quotes.has(firstQuote.dialog), true);
  assertEquals(quotes.has(secondQuote.dialog), true);
});
