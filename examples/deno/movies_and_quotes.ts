import lotrSdk, {
  LotrSdk,
  MoviesResponse,
  QuotesResponse,
} from "https://deno.land/x/lotr@v1.0.2/mod.ts";

const lotr: LotrSdk = lotrSdk({
  // Will default to the environment variable LOTR_API_TOKEN
  // apiToken: "l1bl4b",
});

try {
  await lotr.authenticate();
} catch (error) {
  Deno.stderr.writeSync(new TextEncoder().encode(error.message));
  Deno.exit(1);
}

const moviesResponse: MoviesResponse = await lotr.listMovies();
const movieList = moviesResponse.docs.map((res) => res.name).join("\n - ");
console.log(`## The The Lord of the Rings Movies:\n\n - ${movieList}\n`);

const offset = Math.floor(Math.random() * 100);
const quotesResponse: QuotesResponse = await lotr.listMovieQuotes(
  "5cd95395de30eff6ebccde5b",
  { limit: 5, offset, page: 1 },
);
const quotesList = quotesResponse.docs.map((quote) => quote.dialog).join(
  "\n - ",
);
console.log(
  `## 5 Random Quotes From The Lord of the Rings:\n\n - ${quotesList}\n`,
);

// You can also get a movie by id
// const movie = await lotr.getMovie("5cd95395de30eff6ebccde5b");
