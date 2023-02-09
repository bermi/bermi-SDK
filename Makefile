export DENO_DIR = ./deno_dir
IGNORED_DIRS=deno_dir,npm

all: build

build: \
	lock.json \
	test \
	deno_dir/dist/binaries/lotr-sdk \
	deno_dir/dist/bundles/lotr-sdk.js \
	npm

deno_dir/dist/binaries/%: mod.ts
	mkdir -p deno_dir/dist/binaries
	deno compile --unstable mod.ts --target x86_64-apple-darwin
	mv $* $@-macos-x86
	deno compile --unstable mod.ts --target aarch64-apple-darwin
	mv $* $@-macos-arm
	deno compile --unstable mod.ts --target x86_64-unknown-linux-gnu
	mv $* $@-linux-x86
	deno compile --unstable mod.ts --target x86_64-pc-windows-msvc
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

lint:
	deno lint --unstable --ignore=$(IGNORED_DIRS)

info/%:
	deno info $@

doc/%:
	deno doc $@

repl:
	deno repl --lock=lock.json --unstable  --allow-none

clean:
	rm -rf deno_dir/gen deno_dir/dl deno_dir/dist coverage npm

.PHONY: npm
npm:
	deno run -A scripts/build_npm.ts

npm-publish: npm
	cd npm && npm test && npm publish

test: format lint .git/hooks/pre-commit
	deno test \
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

EXAMPLES=$(wildcard examples/*.ts)
run-examples: $(EXAMPLES)
	for example in $^ ; do \
		echo "Running $${example}"; \
		deno run --unstable $${example} ; \
	done

coverage: clean test
	deno test --coverage=coverage --unstable
	deno coverage --lcov --unstable coverage/ > coverage/coverage.lcov
	genhtml -o coverage/html coverage/coverage.lcov
	open coverage/html/index.html

pre-commit: clean lock.json test build

.git/hooks/pre-commit:
	mkdir -p $(@D)
	echo "#!/bin/sh" > $@
	echo "make pre-commit" >> $@
	chmod +x $@