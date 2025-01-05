.PHONY: format lint

format:
	npx eslint . --fix

lint:
	npx eslint . --max-warnings 2

format-and-lint: format lint

