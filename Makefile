.PHONY: build

build:
	NODE_ENV=production npm run build \
	&& npm run build-electron \
	&& npm run package