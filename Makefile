.PHONY: format lint test test-watch test-coverage

format:
	npx eslint . --fix --max-warnings 2

test:
	npx jest

test-watch:
	npx jest --watch

test-coverage:
	npx jest --coverage --changedSince=preview --coverageReporters="json-summary" --coverageReporters="text"
	./scripts/check-coverage.sh

# All CI tasks

install:
	npm install

lint:
	npx eslint . --max-warnings 2

check-coverage:
	ifeq ($(GITHUB_BASE_REF),)
		npx jest --coverage --changedSince=preview --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
	else
		npx jest --coverage --changedSince=origin/$(GITHUB_BASE_REF) --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
	endif

# All CD Tasks

build:
	npx eas build --platform ios --profile preview

update:
	npx eas update --auto --non-interactive

deploy-ios:
	npx expo publish --non-interactive
	npx eas submit -p ios -e preview --non-interactive