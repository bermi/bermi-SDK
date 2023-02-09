import type {
  Movie,
  MoviesResponse,
  QueryParameters,
  QuotesResponse,
  SdkSession,
} from "../types.ts";

/**
 * List of all movies, including the "The Lord of the Rings" and the "The Hobbit" trilogies
 *
 * @param session API session
 * @param params Query parameters
 * @returns {Promise<MoviesResponse>} A moview response including docs: Movie[]
 * @example listMovies(session, { limit: 10, offset: 0 })
 * @example listMovies(session, { limit: 10, offset: 0 })
 */
export const listMovies = (session: SdkSession<MoviesResponse>) =>
(
  params: QueryParameters = {},
): Promise<MoviesResponse> => session.get("/movie", params);

/**
 * Request one specific movie
 *
 * @param session API session
 * @returns {Promise<Movie>} A movie
 * @example getMovie(session, "5ca1ab1e")
 */
export const getMovie = (session: SdkSession<Movie>) =>
(
  id: string,
  params: QueryParameters = {},
): Promise<Movie> => session.get(`/movie/${id}`, params);

/**
 * Request all movie quotes for one specific movie (only working for the LotR trilogy)
 *
 * @param session API session
 * @param id Movie ID
 * @param params Query parameters
 * @returns {Promise<MovieQuotesResponse>} A moview response including docs: Movie[]
 * @example listMovies(session, { limit: 10, offset: 0 })
 * @example listMovies(session, { limit: 10, offset: 0 })
 */
export const listMovieQuotes = (session: SdkSession<QuotesResponse>) =>
async (
  id: string,
  params: QueryParameters = {},
): Promise<QuotesResponse> => {
  const quotesResponse = await session.get(`/movie/${id}/quote`, params);
  // quotesResponse.docs.id is the same as quotesResponse.docs._id
  // we'll remove the id property to avoid confusion and keep consistency
  // with other responses
  quotesResponse.docs = (quotesResponse.docs || []).map((doc) => (
    { ...doc, id: undefined }
  ));
  return quotesResponse;
};
