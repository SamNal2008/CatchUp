.PHONY: format lint test test-watch test-coverage

format:
	npx eslint . --fix

lint:
	npx eslint . --max-warnings 2

format-and-lint: format lint

test:
	npx jest

test-watch:
	npx jest --watch

test-coverage:
	npx jest --coverage

ci: format-and-lint test-coverage
