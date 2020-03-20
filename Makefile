install:
	npm install

develop:
	npx webpack-dev-server

build:
	npx webpack

lint:
	npx eslint .

publish:
	npm publish