import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Movie, MoviesResponse, QuotesResponse, SdkSession } from "../types.ts";
import { getLogger } from "./logger.ts";
import { getMovie, listMovieQuotes, listMovies } from "./movie.ts";

const theUnexpectedJourney: Movie = {
  _id: "5cd95395de30eff6ebccde58",
  name: "The Unexpected Journey",
  runtimeInMinutes: 169,
  budgetInMillions: 200,
  boxOfficeRevenueInMillions: 1021,
  academyAwardNominations: 3,
  academyAwardWins: 1,
  rottenTomatoesScore: 64,
};

const theDesolationOfSmaug: Movie = {
  _id: "5cd95395de30eff6ebccde59",
  name: "The Desolation of Smaug",
  runtimeInMinutes: 161,
  budgetInMillions: 217,
  boxOfficeRevenueInMillions: 958.4,
  academyAwardNominations: 3,
  academyAwardWins: 0,
  rottenTomatoesScore: 75,
};

const multipleMovies: MoviesResponse = {
  docs: [theUnexpectedJourney, theDesolationOfSmaug],
  total: 8,
  limit: 2,
  offset: 2,
};

const movieQuotes: QuotesResponse = {
  docs: [
    {
      "_id": "5cd96e05de30eff6ebcce9ba",
      "dialog": "All our hopes now lie with two little Hobbits...",
      "movie": "5cd95395de30eff6ebccde5b",
      "character": "5cd99d4bde30eff6ebccfea0",
    },
  ],
  total: 2000,
  limit: 0,
  offset: 0,
};

const mockSession = (
  serverResponse: Movie | MoviesResponse | QuotesResponse,
): SdkSession<Movie | MoviesResponse | QuotesResponse> => ({
  get() {
    return new Promise((resolve) => {
      resolve(serverResponse);
    }) as Promise<Movie | MoviesResponse | QuotesResponse>;
  },
  logger: getLogger(),
});

Deno.test("listMovies", async () => {
  const response = await listMovies(
    mockSession(multipleMovies) as SdkSession<MoviesResponse>,
  )();
  const expected = multipleMovies;
  assertEquals(response, expected);
});

Deno.test("getMovie", async () => {
  const response = await getMovie(
    mockSession(theUnexpectedJourney) as SdkSession<Movie>,
  )(
    "5cd95395de30eff6ebccde58",
  );
  assertEquals(response, theUnexpectedJourney);
});

Deno.test("listMovieQuotes", async () => {
  const response = await listMovieQuotes(
    mockSession(movieQuotes) as SdkSession<QuotesResponse>,
  )(
    "5cd95395de30eff6ebccde5b",
  );
  assertEquals(response, movieQuotes);
});
