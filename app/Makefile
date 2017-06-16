DEVSERVER_ARGS ?=
BROWSERIFY_TRANSFORM_ARGS ?= [ babelify --presets [ es2015 react ] --plugins [ transform-object-rest-spread ] ]
DIST_MODULES := bootstrap bootstrap-material-design jquery snackbarjs

.PHONY: default help clean distclean dev-image prod-image dev prod _watchify

default: help

help:
	@echo "Please use Makefile in the parent directory."

clean:
	rm -rf build

distclean: clean
	rm -rf client/node_modules

dev-image: build/dev/.image.stamp

prod-image: build/prod/.image.stamp

dev: build/dev/.stamp

prod: build/prod/.stamp

# Used by devserver_main.py.
_watchify:
	mkdir -p /tmp/livesite
	cd client && node_modules/.bin/watchify js/index.js -t $(BROWSERIFY_TRANSFORM_ARGS) -d -o /tmp/livesite/bundle.js -v

build/dev/.image.stamp: build/dev/.stamp
	sudo docker build -t asia.gcr.io/icpcsec/livesite-app:dev build/dev
	touch $@

build/dev/.stamp: build/dev/static/.stamp build/dev/livesite build/dev/bin build/dev/requirements.txt build/dev/Dockerfile
	touch $@

build/dev/static/.stamp: build/dev/static/assets/.stamp build/dev/static/images
	touch $@

build/dev/static/assets/.stamp: client/node_modules/.stamp
	rm -rf `dirname $@`
	mkdir -p `dirname $@`
	set -e; for i in $(DIST_MODULES); do mkdir -p build/dev/static/assets/$$i; ln -s ../../../../../client/node_modules/$$i/dist build/dev/static/assets/$$i/; done
	ln -s ../../../../client/third_party/japan-map build/dev/static/assets/
	mkdir -p build/dev/static/assets/livesite
	ln -s ../../../../../client/css build/dev/static/assets/livesite/
	mkdir -p build/dev/static/assets/livesite/js
	ln -s /tmp/livesite/bundle.js build/dev/static/assets/livesite/js/
	touch $@

build/dev/static/images:
	mkdir -p `dirname $@`
	ln -s ../../../images $@

build/dev/livesite:
	mkdir -p `dirname $@`
	ln -s ../../server/livesite $@

build/dev/requirements.txt: server/requirements.txt
	mkdir -p `dirname $@`
	cp server/requirements.txt $@

build/dev/bin:
	mkdir -p `dirname $@`
	ln -s ../../bin $@

build/dev/Dockerfile: docker/Dockerfile.dev
	mkdir -p `dirname $@`
	cp $< $@

build/prod/.image.stamp: build/prod/.stamp
	sudo docker build -t asia.gcr.io/icpcsec/livesite-app:latest build/prod
	touch $@

build/prod/.stamp: build/dev/.stamp build/prod/Dockerfile build/prod/static/assets/livesite/js/bundle.js
	mkdir -p `dirname $@`
	rsync -rpLt --delete --exclude='.*' --exclude='*.pyc' --exclude='Dockerfile' --exclude='static/assets/livesite/js/bundle.js' build/dev/ build/prod/
	touch $@

build/prod/Dockerfile: docker/Dockerfile.prod
	mkdir -p `dirname $@`
	cp $< $@

build/prod/static/assets/livesite/js/bundle.js: client/node_modules/.stamp $(shell find client/js -name '*.js')
	mkdir -p `dirname $@`
	cd client && NODE_ENV=production node_modules/.bin/browserify js/index.js -t $(BROWSERIFY_TRANSFORM_ARGS) -g envify -g uglifyify -o ../$@

client/node_modules/.stamp: client/package.json
	cd client && npm install
	touch $@
