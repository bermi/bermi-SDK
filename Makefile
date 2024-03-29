SHELL = /bin/bash -o pipefail

APP_NAME=lotr-sdk
export DENO_DIR = ./deno_dir
IGNORED_DIRS=deno_dir,npm,examples
ALLOWED_ENV_VARS=LOTR_API_VERSION,LOTR_API_ENDPOINT,LOTR_API_TOKEN,DEBUG
ALLOWED_NET=the-one-api.dev
SRC_FILES=$(wildcard src/*.ts)
BIN_DIR=deno_dir/dist/binaries
# .exe is not needed for the target, but it allows us to avoid having to recompile
# that's the reason we use basename in the compile target
BINARY_TARGETS=x86_64-apple-darwin aarch64-apple-darwin x86_64-unknown-linux-gnu x86_64-pc-windows-msvc.exe
BINARIES=$(addprefix $(BIN_DIR)/,$(BINARY_TARGETS))

# Appends to .env lines not found on .env-sample, this helps developers
# filling in the gaps with any new environment setting that's added
.env: .env-sample
	@echo "Environment variables copied from .env-sample to .env"
	@touch $@
	@while read -r LINE; do \
		grep -qF -- "$$LINE" $@ || echo "$$LINE" >> $@; \
	done < $<
	@echo "Please edit .env to set your environment variables"

# Exposes all environment variables from .env to the makefile
include .env
export

all: build

build: \
	lock.json \
	test \
	compile \
	deno_dir/dist/bundles/$(APP_NAME).js \
	npm

compile: $(BINARIES)
deno_dir/dist/binaries/%: mod.ts $(SRC_FILES)
	mkdir -p $(@D)
	deno compile --allow-env=$(ALLOWED_ENV_VARS) --allow-net=$(ALLOWED_NET) --unstable --target $(basename $*) --output $(basename $@) mod.ts

.PHONY: deno_dir/dist/releases
deno_dir/dist/releases: compile
	mkdir -p $@
	cp -R deno_dir/dist/binaries/x86_64-apple-darwin $@/$(APP_NAME)-darwin-amd64
	cp -R deno_dir/dist/binaries/x86_64-unknown-linux-gnu $@/$(APP_NAME)-linux-amd64
	cp -R deno_dir/dist/binaries/x86_64-pc-windows-msvc.exe $@/$(APP_NAME)-windows-amd64.exe
	cp -R deno_dir/dist/binaries/aarch64-apple-darwin $@/$(APP_NAME)-darwin-arm64
	make deno_dir/dist/releases/$(APP_NAME)-darwin-amd64.checksum \
		deno_dir/dist/releases/$(APP_NAME)-linux-amd64.checksum \
		deno_dir/dist/releases/$(APP_NAME)-windows-amd64.exe.checksum \
		deno_dir/dist/releases/$(APP_NAME)-darwin-arm64.checksum

deno_dir/dist/releases/%.checksum: deno_dir/dist/releases/%
	shasum -a 256 $< 2> /dev/null | cut -d " " -f1 > $@

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

coverage: clean test guard-LOTR_API_TOKEN ensure-binary-lcov
	RUN_INTEGRATION_TESTS=true deno test -A --coverage=coverage --unstable
	deno coverage --lcov --unstable coverage/ > coverage/coverage.lcov
	genhtml -o coverage/html coverage/coverage.lcov
	if [ "$$(uname)" = "Darwin" ]; then \
		open coverage/html/index.html; \
	fi;

pre-commit: clean lock.json format test build

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Required environment variable $* not set"; \
		exit 1; \
	fi

ensure-binary-%:
	@ if ! command -v ${*} &> /dev/null; then \
		echo "Required binary ${*} not found"; \
		if [ "$$(uname)" = "Darwin" ]; then \
			echo "Please install it using brew: brew install ${*}"; \
			read -p "Do you want to install it? [y/N] " -n 1 -r; \
			echo ""; \
			if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
				brew install ${*}; \
				exit 0; \
			fi; \
		elif [ "$$(uname)" = "Linux" ]; then \
			echo "Please install it using apt: apt install ${*}"; \
			read -p "Do you want to install it? [y/N] " -n 1 -r; \
			echo ""; \
			if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
				sudo apt install ${*}; \
				exit 0; \
			fi; \
		fi; \
		exit 1; \
	fi

.git/hooks/pre-commit:
	mkdir -p $(@D)
	echo "#!/bin/sh" > $@
	echo "make pre-commit" >> $@
	chmod +x $@