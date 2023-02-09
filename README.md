# lotr-sdk

🧙‍♂️ [`lotr-sdk`](https://github.com/bermi/bermi-SDK) The Lord of the Rings SDK

Available via [npm for node.js](https://www.npmjs.com/package/@bermi/lotr-sdk),
[deno 🦕](https://deno.land/x/lotr).

## Documentation

### Usage

In node.js, install with npm `npm install @bermi/lotr-sdk --save`. Then require
it in your project with:

```javascript
const lotrSdk = require("@bermi/lotr-sdk").default;
```

Using TypeScript:

```typescript
import lotrSdk, { LotrSdk } from "@bermi/lotr-sdk";
```

Using Deno:

```typescript
import lotrSdk, { LotrSdk } from "https://deno.land/x/lotr@v1.0.2/mod.ts";
```

### Example

```typescript
const lotr: LotrSdk = lotrSdk({
  apiToken: "l1bl4b", // Will default to the environment variable LOTR_API_TOKEN
});

// Authenticate the session. Automatically called,
// but it's recommended to call it manually to handle
// authentication errors in the right context.
await lotr.authenticate();

// For list methods you can pass pagination options
const options = { limit: 2, offset: 0, page: 1 };

// Get a list of movies
const movies = await lotr.listMovies(); // => { docs: [{ _id: "123", name: "The Fellowship of the Ring" }], ... }

// Get a movie by id
const movie = await lotr.getMovie("123"); // => { _id: "123", name: "The Fellowship of the Ring" }

// Get a list of quotes for a movie
const quotes = await lotr.listMovieQuotes("123"); // => { docs: [{ _id: "456", character: "789", dialog: "You shall not pass!" }], ... }
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

The `Makefile` includes shortcuts to commands that will help test the project
and run the examples.

### Documentation

The command `deno doc mod.ts` will show the documentation for the project.

## Releasing

Calling `make build` will generate multiple versions of this project.

### npm

The npm directory contains a node.js-compatible version of the project ready to
be pushed to npm. You can use `make npm-publish` to publish the latest version.

### cli

The directory deno_dir/dist/binaries/ contains standalone binary versions of the
program for Linux, MacOS, and Windows.

### deno

Use <https://deno.land/add_module> to expose this project on
<https://deno.land/x/lotr>

## Tests

![tests](https://github.com/bermi/bermi-SDK/actions/workflows/deno.yml/badge.svg)

To run the tests, call:

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
