/**
 * The Lord of the Rings SDK
 *
 * @module @bermi/lotr-sdk
 *
 * @example
 *    import lotrSdk, {
 *      LotrSdk,
 *      Movie,
 *      MoviesResponse,
 *      PaginationOptions,
 *      Quote,
 *      QuotesResponse,
 *    } from "https://deno.land/x/lotr/mod.ts";
 *
 *    const lotr: LotrSdk = lotrSdk({ apiToken: "l1bl4b" });
 *
 *    // Authenticate the session
 *    await lotr.authenticate();
 *
 *    // For list methods, the pagination options can be passed as the last argument
 *    const options: PaginationOptions = { limit: 2, offset: 0, page: 1 };
 *
 *    // Get a list of movies
 *    const movies: Movie[] = await lotr.listMovies(); // => { docs: [{ _id: "123", name: "The Fellowship of the Ring" }], ... }
 *
 *    // Get a movie by id
 *    const movie: MoviesResponse = await lotr.getMovie("123"); // => { _id: "123", name: "The Fellowship of the Ring" }
 *
 *    // Get a list of quotes for a movie
 *    const quotes: QuotesResponse = await lotr.listMovieQuotes("123"); // => { docs: [{ _id: "456", character: "789", dialog: "You shall not pass!" }], ... }
 */

import type {
  LotrSdk,
  Movie,
  MoviesResponse,
  QueryParameters,
  QuotesResponse,
  SdkOptions,
  SdkSession,
} from "../types.ts";
import movie from "./movie.ts";
import { createApiSession } from "./session.ts";

export default (options: SdkOptions = {
  apiToken: Deno.env.get("LOTR_API_TOKEN") || "",
}): LotrSdk => {
  const session = createApiSession(options);

  // The public SDK api methods are defined here
  // We can use this closure to memoize results and use them
  // across method calls. See the Cachins section on design.md
  // for details
  const listMovies = (params: QueryParameters = {}): Promise<MoviesResponse> =>
    movie.listMovies(session as SdkSession<MoviesResponse>)(params);
  const getMovie = (id: string): Promise<Movie> =>
    movie.getMovie(session as SdkSession<Movie>)(id);
  const listMovieQuotes = (
    id: string,
    params: QueryParameters = {},
  ): Promise<QuotesResponse> =>
    movie.listMovieQuotes(session as SdkSession<QuotesResponse>)(id, params);

  return {
    authenticate: session.authenticate || (() => Promise.resolve()),
    getMovie,
    listMovieQuotes,
    listMovies,
  };
};
