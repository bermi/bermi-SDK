const lotrSdk = require("@bermi/lotr-sdk").default;

const lotr = lotrSdk();

lotr.listMovies().then(res => {
  const movies = res.docs.map(res => res.name).join("\n - ");
  console.log(`## The The Lord of the Rings Movies:\n\n - ${movies}\n`);
});

const offset = Math.floor(Math.random() * 100);
lotr.listMovieQuotes("5cd95395de30eff6ebccde5b", { limit: 5, offset, page: 1 }).then(res => {
  const quotes = res.docs.map(quote => quote.dialog).join("\n - ");
  console.log(`## 5 Random Quotes From The Lord of the Rings:\n\n - ${quotes}\n`);
});

// You can also get a movie by id using async/await
// const movie = await lotr.getMovie("5cd95395de30eff6ebccde5b");
