import type {
  LotrCollectionResponse,
  LotrDocumentResponse,
  QueryParameters,
  RequestOptions,
  SdkOptions,
  SdkSession,
} from "../types.ts";
import { getLogger } from "./logger.ts";

const LEADING_SLASH_RE = /^\//;
const TRAILING_SLASH_RE = /\/$/;
const DEBUG_HEADERS = [
  "content-length",
  "content-type",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "x-ratelimit-reset",
];

export const defaultOptions = {
  apiVersion: (Deno.env.get("LOTR_API_VERSION") || "v2").replace(
    TRAILING_SLASH_RE,
    "",
  ),
  apiEndpoint: (Deno.env.get("LOTR_API_ENDPOINT") || "https://the-one-api.dev")
    .replace(TRAILING_SLASH_RE, ""),
  apiToken: Deno.env.get("LOTR_API_TOKEN") || "",
};

const buildQueryStringFromParams = (params: QueryParameters = {}) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    query.append(key, value.toString());
  }
  return query.toString();
};

const getUrl = (
  apiEndpoint: string = defaultOptions.apiEndpoint,
  params: QueryParameters = {},
) => {
  const query = buildQueryStringFromParams(params);
  // Only append the query string if it's not empty
  return query ? `${apiEndpoint}?${query}` : apiEndpoint;
};

export const createApiSession = (
  options: SdkOptions,
): SdkSession<LotrCollectionResponse | LotrDocumentResponse> | never => {
  const { apiVersion, apiEndpoint, apiToken } = {
    ...defaultOptions,
    ...options,
  };
  const baseUrl = `${apiEndpoint}/${apiVersion}`;
  const logger = options.logger || getLogger();
  let authenticated = false;

  if (!apiToken) {
    throw new Error(
      "API token is required. Please set the LOTR_API_TOKEN or pass it as an option. " +
        `You can get your API token from ${apiEndpoint}/sign-up`,
    );
  }

  const authenticate = async () => {
    const url = getUrl(`${baseUrl}/movie`);
    logger.info(`HEAD ${url} authenticating...`);
    // Just send a HEAD request to the API to check if the token is valid
    const response = await fetch(url, { method: "HEAD", headers });
    if (response.status === 401) {
      throw new Error("Invalid API token");
    }
    if (!response.ok) {
      throw new Error(
        `Request failed with status code ${response.status}`,
      );
    }
    authenticated = true;
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiToken}`,
  };
  return {
    authenticate,
    get: async (
      path: string,
      params: QueryParameters = {},
      options: RequestOptions = {
        headers,
      },
    ): Promise<LotrCollectionResponse | LotrDocumentResponse> => {
      const url = getUrl(
        `${baseUrl}/${path.replace(LEADING_SLASH_RE, "")}`,
        params,
      );

      if (!authenticated) {
        await authenticate();
      }
      logger.info(`GET: ${url}`);
      const response = await fetch(url, options);

      // Log response headers
      logger.debug(`RESPONSE: ${
        JSON.stringify({
          url,
          status: response.status,
          // only log the headers we care about
          headers: [...response.headers].filter(([key]) =>
            DEBUG_HEADERS.includes(key)
          ).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        })
      }`);

      // If the token has expired, or revoked, we need to re-authenticate
      // and try again
      if (response.status === 401) {
        authenticated = false;
        throw new Error("Invalid API token");
      }

      if (!response.ok) {
        throw new Error(
          `Request failed with status code ${response.status}`,
        );
      }
      return (await response.json()) as LotrCollectionResponse;
    },
    logger,
  };
};
