/**
 * The Lord of the Rings SDK.
 * @typedef {Object} LotrSdk
 * @property {Function} authenticate - Authenticates the SDK with the API.
 * @property {Function} getMovie - Returns a movie by ID.
 * @property {Function} listMovies - Returns a list of movies.
 * @property {Function} listMovieQuotes - Returns a list of quotes for a given movie.
 */
export interface LotrSdk {
  authenticate: () => Promise<void>;
  getMovie: (id: string) => Promise<Movie>;
  listMovies: (params: QueryParameters) => Promise<MoviesResponse>;
  listMovieQuotes: (
    id: string,
    params: QueryParameters,
  ) => Promise<QuotesResponse>;
}

/**
 * A configuration object for the SDK.
 * @typedef {Object} SdkOptions
 * @property {string} apiEndpoint - The base endpoint for the API. Defaults to https://the-one-api.dev.
 * @property {string} apiVersion - The version of the API to use. Defaults to v2.
 * @property {string} apiToken - The API access token.
 */
export interface SdkOptions {
  apiEndpoint?: string;
  apiVersion?: string;
  apiToken: string;
  logger?: Logger;
}

/**
 * A logger object for logging messages.
 * @typedef {Object} Logger
 * @property {Function} debug - Logs a debug message.
 * @property {Function} error - Logs an error message.
 * @property {Function} info - Logs an info message.
 * @property {Function} warn - Logs a warning message.
 */
export interface Logger {
  debug: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
}

/**
 * Options for an API request.
 * @typedef {Object} RequestOptions
 * @property {Object} headers - The headers to include with the request.
 * @property {string} headers.Authorization - The API access token.
 * @property {string} headers.Content-Type - The content type of the request.
 * @property {number} timeout - The number of milliseconds to wait for a response before timing out.
 */
export interface RequestOptions {
  headers: {
    Authorization: string;
    "Content-Type": string;
  };
  timeout?: number;
}

/**
 * A session object for interacting with the API.
 * @typedef {Object} SdkSession
 * @property {Function} get - Makes a GET request to the API.
 * @property {Function} authenticate - Authenticates the session with the API.
 * @property {Logger} logger - A logger object for logging messages.
 * @typeParam T  - The type of the response.
 */
export interface SdkSession<T> {
  get: (
    path: string,
    params?: QueryParameters,
    options?: RequestOptions,
  ) => Promise<T>;
  authenticate?: () => Promise<void>;
  logger: Logger;
}

/**
 * Options for pagination.
 * @typedef {Object} PaginationOptions
 * @property {number} limit - The maximum number of items to return per page.
 * @property {number} offset - The number of items to skip before starting the list of items returned.
 * @property {number} page - The page number to return.
 */
export interface PaginationOptions {
  limit: number;
  offset: number;
  page: number;
}

/**
 * Query parameters for an API request.
 * @typedef {Object} QueryParameters
 * @extends PaginationOptions
 */
export type QueryParameters = Partial<PaginationOptions>;

/**
 * Information about a movie.
 * @typedef {Object} Movie
 * @property {string} _id - The ID of the movie.
 * @property {number} academyAwardNominations - The number of Academy Award nominations the movie received.
 * @property {number} academyAwardWins - The number of Academy Awards the movie won.
 * @property {number} boxOfficeRevenueInMillions - The box office revenue of the movie in millions.
 * @property {number} budgetInMillions - The budget of the movie in millions.
 * @property {string} name - The name of the movie.
 * @property {number} rottenTomatoesScore - The Rotten Tomatoes score for the movie.
 * @property {number} runtimeInMinutes - The runtime of the movie in minutes.
 */
export interface Movie {
  _id: string;
  academyAwardNominations: number;
  academyAwardWins: number;
  boxOfficeRevenueInMillions: number;
  budgetInMillions: number;
  name: string;
  rottenTomatoesScore: number;
  runtimeInMinutes: number;
}

/**
 * Defines the structure of a movie quote.
 * @typedef {Object} Quote
 * @property {string} _id - A unique identifier for the quote.
 * @property {string} character - The _id for the character  who said the quote.
 * @property {string} dialog - The quote text.
 * @property {string} movie - The name of the movie the quote is from.
 */
export interface Quote {
  _id: string;
  character: string;
  dialog: string;
  // When the API returns a quote from a resource such as a movie,
  // the movie property is empty.
  movie?: string;
}

/**
 * Defines the structure of a response from the API when multiple documents of a given type are included.
 * @typeParam T - The type of the documents included in the response.
 * @typedef {Object} ApiResponse
 * @property {T[]} docs - An array of documents returned from the API.
 * @property {number} limit - The maximum number of documents returned on a single response.
 * @property {number} offset - The number of documents skipped in the current response.
 * @property {number} page - The current page of documents returned in the response.
 * @property {number} pages - The total number of pages of documents.
 * @property {number} total - The total number of documents.
 */
interface ApiResponse<T> {
  docs: T[];
  limit: number;
  offset: number;
  page?: number;
  pages?: number;
  total: number;
}

/**
 * Defines the structure of a response from the API that includes multiple movies.
 */
export type MoviesResponse = ApiResponse<Movie>;

/**
 * Defines the structure of a response from the API that includes multiple movie quotes.
 */
export type QuotesResponse = ApiResponse<Quote>;

/**
 * Defines the structure of a response from the API that includes multiple documents of different types.
 * @typedef {Object} LotrCollectionResponse
 * @property {MoviesResponse} docs - An array of movies returned from the API.
 * @property {QuotesResponse} docs - An array of quotes returned from the API.
 * @property {number} limit - The maximum number of documents returned on a single response.
 * @property {number} offset - The number of documents skipped in the current response.
 * @property {number} page - The current page of documents returned in the response.
 * @property {number} pages - The total number of pages of documents.
 * @property {number} total - The total number of documents.
 */
export type LotrCollectionResponse =
  & Partial<MoviesResponse>
  & Partial<QuotesResponse>;

export type LotrDocumentResponse = Partial<Movie> & Partial<Quote>;
