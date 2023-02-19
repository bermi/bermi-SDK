import lotrSdk, { LotrSdk } from "https://deno.land/x/lotr@v1.3.0/mod.ts";

// import lotrSdk, { LotrSdk, MoviesResponse, QuotesResponse } from "../../mod.ts";

const lotr: LotrSdk.LotrSdk = lotrSdk(
  // Will default to the environment variable LOTR_API_TOKEN
  // apiToken: "l1bl4b",
);

try {
  await lotr.authenticate();
} catch (error) {
  Deno.stderr.writeSync(new TextEncoder().encode(error.message));
  Deno.exit(1);
}

const moviesResponse: LotrSdk.MoviesResponse = await lotr.listMovies({});
const movieList = moviesResponse.docs.map((res) => res.name).join("\n - ");
console.log(`## The The Lord of the Rings Movies:\n\n - ${movieList}\n`);

const offset = Math.floor(Math.random() * 100);
const quotesResponse: LotrSdk.QuotesResponse = await lotr.listMovieQuotes(
  "5cd95395de30eff6ebccde5b",
  { limit: 5, offset, page: 1 },
);
const quotesList = quotesResponse.docs.map((quote) => quote.dialog).join(
  "\n - ",
);
console.log(
  `## 5 Random Quotes From The Lord of the Rings:\n\n - ${quotesList}\n`,
);

// // You can also get a movie by id
// const movie = await lotr.getMovie("5cd95395de30eff6ebccde5b");

// // Use lotr.getAllMovies() to get all movies using an async iterator
// for await (const movie of lotr.allMovies()) {
//   console.log({ movie });
// }

// // Iterate all quotes for a movie
// for await (const quote of lotr.allMovieQuotes("5cd95395de30eff6ebccde5b")) {
//   console.log({ quote });
// }
