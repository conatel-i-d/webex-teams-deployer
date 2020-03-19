.PHONY: build

build:
	rm -Rf ./dist/ \
	&& NODE_ENV=production npm run build \
	&& npm run build-electron \
	&& npm run package