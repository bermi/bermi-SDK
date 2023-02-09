# lotr-sdk

[`lotr-sdk`](https://github.com/bermi/bermi-SDK) The Lord of the Rings SDK

## Documentation

### Usage

#### Node.js

Install with npm `npm install @bermi/lotr-sdk --save`.

Import the main `lotrSdk` function and type definitions under `LotrSdk`.

##### Using JavaScript

```javascript
const lotrSdk = require("@bermi/lotr-sdk");
```

##### Using Typescript

Import the main `lotrSdk` function and type definitions under `LotrSdk`.

```typescript
import lotrSdk, { LotrSdk } from "@bermi/lotr-sdk";
```

#### Deno

Import the main `lotrSdk` function and type definitions under `LotrSdk`.

```typescript
import lotrSdk, { LotrSdk } from "https://deno.land/x/lotr-sdk@v1.0.0/mod.ts";
```

### Example

```typescript
const lotr: LotrSdk = lotrSdk({ apiToken: "l1bl4b" });

// Authenticate the session
await lotr.authenticate();

// For list methods, the pagination options can be passed as the last argument
const options: PaginationOptions = { limit: 2, offset: 0, page: 1 };

// Get a list of movies
const movies: Movie[] = await lotr.listMovies(); // => { docs: [{ _id: "123", name: "The Fellowship of the Ring" }], ... }

// Get a movie by id
const movie: MoviesResponse = await lotr.getMovie("123"); // => { _id: "123", name: "The Fellowship of the Ring" }

// Get a list of quotes for a movie
const quotes: QuotesResponse = await lotr.listMovieQuotes("123"); // => { docs: [{ _id: "456", character: "789", dialog: "You shall not pass!" }], ... }
```

## Examples

The directory `./examples` contains examples showing how to use this library.

To run all the examples, call:

```shell
make run-examples
```

### Design decisions

Please read the [design document](./design.md) for more information about the
design decisions.

## Development

`lotr-sdk` has been developed using [deno 🦕](https://deno.land/).

The `Makefile` includes shortcuts to commands that will help testing the project
and run the examples.

### Documentation

The command `deno doc mod.ts` will show the documentation for the project.

## Releasing

Calling `make build` will generate multiple versions of this project.

### npm

The npm directory contains a node.js compatible version of the project ready to
be pushed to npm. You can use `make npm-publish` to publish the latest version.

### cli

The directory deno_dir/dist/binaries/ contains standalone binary versions of the
program for Linux, MacOS and Windows.

### deno

Use <https://deno.land/add_module> to expose this project on
<https://deno.land/x/lotr-sdk>

## Tests

![tests](https://github.com/bermi/bermi-SDK/actions/workflows/deno.yml/badge.svg)

To run the tests, call

```shell
make test
```

## License

MIT License

Copyright (c) 2023 Bermi Ferrer

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
