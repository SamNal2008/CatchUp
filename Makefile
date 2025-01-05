.PHONY: format lint test test-watch test-coverage

format:
	npx eslint . --fix

format-and-lint: format lint

test:
	npx jest

test-watch:
	npx jest --watch

test-coverage:
	npx jest --coverage --coverageReporters="json" --coverageReporters="text"

ci: format-and-lint test-coverage

# All CI tasks

install:
	npm run ci

lint:
	npx eslint . --max-warnings 2

check-coverage:
	npx jest --coverage --coverageReporters="json" --coverageReporters="text"
	npx ./scripts/check-diff-coverage.js


# All CD Tasks

build:
	npx eas build --platform ios --profile preview

update:
	npx eas update --auto --non-interactive

deploy-ios:
	npx expo publish --non-interactive
	npx eas submit -p ios -e preview --non-interactive