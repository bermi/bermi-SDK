export DENO_DIR = ./deno_dir
IGNORED_DIRS=deno_dir,npm,examples
ALLOWED_ENV_VARS=LOTR_API_VERSION,LOTR_API_ENDPOINT,LOTR_API_TOKEN,DEBUG
ALLOWED_NET=the-one-api.dev
SRC_FILES=$(wildcard src/*.ts)

# Make sure the current directory name is lotr-sdk, this will simplify
# building the binaries and bundles.
ifneq ($(notdir $(CURDIR)),lotr-sdk)
$(error Please make sure the repo directory name is lotr-sdk.)
endif

all: build

build: \
	lock.json \
	test \
	deno_dir/dist/binaries/lotr-sdk \
	deno_dir/dist/bundles/lotr-sdk.js \
	npm

deno_dir/dist/binaries/%: mod.ts $(SRC_FILES)
	mkdir -p deno_dir/dist/binaries
	deno compile --allow-env=$(ALLOWED_ENV_VARS) --allow-net=$(ALLOWED_NET) --unstable mod.ts --target x86_64-apple-darwin
	mv $* $@-macos-x86
	deno compile --allow-env=$(ALLOWED_ENV_VARS) --allow-net=$(ALLOWED_NET) --unstable mod.ts --target aarch64-apple-darwin
	mv $* $@-macos-arm
	deno compile --allow-env=$(ALLOWED_ENV_VARS) --allow-net=$(ALLOWED_NET) --unstable mod.ts --target x86_64-unknown-linux-gnu
	mv $* $@-linux-x86
	deno compile --allow-env=$(ALLOWED_ENV_VARS) --allow-net=$(ALLOWED_NET) --unstable mod.ts --target x86_64-pc-windows-msvc
	mv $* $@.exe

deno_dir/dist/bundles/%.js: mod.ts
	mkdir -p deno_dir/dist/bundles
	deno bundle mod.ts > $@

lock.json: src/deps.ts
	rm -rf deno_dir/deps
	deno cache --lock=$@ --lock-write $<
	deno cache src/deps.ts
	test -d deno_dir/deps && git add deno_dir/deps/* || true

format:
	deno fmt --ignore=$(IGNORED_DIRS)
	deno fmt examples/deno

lint:
	deno lint --unstable --ignore=$(IGNORED_DIRS)

info/%:
	deno info $@

doc/%:
	deno doc $@

repl:
	deno repl --lock=lock.json --unstable  --allow-none

clean:
	rm -rf deno_dir/gen deno_dir/dl deno_dir/dist coverage npm examples/*/node_modules

.PHONY: npm
npm:
	deno run -A scripts/build_npm.ts

npm-publish: npm
	cd npm && npm test && npm publish --access public

test: format lint .git/hooks/pre-commit
	deno test \
		--allow-env=$(ALLOWED_ENV_VARS),RUN_INTEGRATION_TESTS \
		--allow-none \
		--unstable \
		--ignore=$(IGNORED_DIRS)

test-integration: format lint .git/hooks/pre-commit guard-LOTR_API_TOKEN
	RUN_INTEGRATION_TESTS=true deno test \
		--allow-env=$(ALLOWED_ENV_VARS),RUN_INTEGRATION_TESTS  \
		--allow-net=$(ALLOWED_NET) \
		--allow-none \
		--unstable \
		--ignore=$(IGNORED_DIRS)

test-cached-deps: format lint lock.json
	deno test \
		--lock=lock.json \
		--cached-only \
		--allow-none \
		--unstable \
		--ignore=$(IGNORED_DIRS)

run-examples: guard-LOTR_API_TOKEN
	deno run \
		--allow-env=$(ALLOWED_ENV_VARS),RUN_INTEGRATION_TESTS  \
		--allow-net=$(ALLOWED_NET) \
		 examples/deno/movies_and_quotes.ts
	cd examples/nodejs/ && npm install && node index.js

docs:
	deno doc mod.ts

coverage: clean test
	RUN_INTEGRATION_TESTS=true deno test -A --coverage=coverage --unstable
	deno coverage --lcov --unstable coverage/ > coverage/coverage.lcov
	genhtml -o coverage/html coverage/coverage.lcov
	open coverage/html/index.html

pre-commit: clean lock.json format test build

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Required environment variable $* not set"; \
		exit 1; \
	fi

.git/hooks/pre-commit:
	mkdir -p $(@D)
	echo "#!/bin/sh" > $@
	echo "make pre-commit" >> $@
	chmod +x $@