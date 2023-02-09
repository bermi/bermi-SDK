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

  if (!apiToken) {
    throw new Error(
      "API token is required. Please set the LOTR_API_TOKEN or pass it as an option. " +
        `You can get your API token from ${apiEndpoint}/sign-up`,
    );
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiToken}`,
  };
  return {
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
      logger.info(`GET ${url}`);
      console.log({ baseUrl, params, options, url });

      const response = await fetch(url, options);
      if (response.status === 401) {
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
