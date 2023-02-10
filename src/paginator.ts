import type { QueryParameters } from "../types.ts";
/**
 * The response from the data fetching functions.
 * @template T The type of the documents.
 */
type IteratorResponse<T> = {
  /** The array of documents */
  docs: T[];
  /** The total number of documents */
  total: number;
};

/**
 * A generic function that fetches data and returns an async iterator.
 * @template T The type of the documents.
 * @param fetchData A function that fetches the data.
 * @param params The pagination options.
 * @returns An async iterator of the documents.
 */
async function* allData<T>(
  fetchData: (params: QueryParameters) => Promise<IteratorResponse<T>>,
  params: QueryParameters = {},
) {
  const limit = params.limit || 1000;
  const p = { ...params, limit, offset: 0, page: 0 };
  let res = await fetchData(p);
  yield* res.docs;
  let totalDocs = res.total;

  while (res.docs.length < totalDocs && totalDocs > 0) {
    p.page += 1;
    p.offset += limit;
    res = await fetchData(p);
    yield* res.docs;
    totalDocs -= limit;
  }
}

export { allData };
