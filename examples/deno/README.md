# Lord of the Rings 🧙‍♂️ API Deno 🦕 Example

You'll need to expose `LOTR_API_TOKEN` as an environment variable to run the
example.

To run the example with only the required permissions, call:

```shell
deno run \
  --allow-net=the-one-api.dev \
  --allow-env=LOTR_API_TOKEN,LOTR_API_VERSION,LOTR_API_ENDPOINT,DEBUG \
  movies_and_quotes.ts
```

To run with all permissions, call:

```shell
deno run \
  --allow-all \
  movies_and_quotes.ts
```
