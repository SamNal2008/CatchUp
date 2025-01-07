.PHONY: format lint test test-watch test-coverage

format:
	npx eslint . --fix --max-warnings 2

test:
	npx jest

test-watch:
	npx jest --watch

test-coverage:
	npx jest --coverage --coverageReporters="json-summary" --coverageReporters="text"

# All CI tasks

install:
	npm install

lint:
	npx eslint . --max-warnings 2

check-coverage:
	npx jest --coverage --changedSince=preview --coverageReporters="json-summary" --coverageReporters="text"

# All CD Tasks

build:
	npx eas build --platform ios --profile preview

update:
	npx eas update --auto --non-interactive

deploy-ios:
	npx expo publish --non-interactive
	npx eas submit -p ios -e preview --non-interactive