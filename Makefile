.PHONY: format lint test test-watch test-coverage

format:
	npx eslint . --fix --max-warnings 3

test:
	npx jest

test-watch:
	npx jest --watch

test-coverage:
	npx jest --coverage --coverageReporters="json-summary" --coverageReporters="text"
	./scripts/check-coverage.sh

# All CI tasks

install:
	npm install

check-coverage:
	npx jest --coverage --changedSince=preview --coverageReporters="json-summary" --coverageReporters="text"

# All CD Tasks

upload-source-maps:
	npx sentry-expo-upload-sourcemaps dist

build:
	eas build --platform ios --profile preview

update:
	eas update --auto --non-interactive

deploy-ios:
	npx expo publish --non-interactive
	eas submit -p ios -e preview --non-interactive