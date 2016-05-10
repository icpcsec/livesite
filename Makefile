DEVSERVER_ARGS ?=
BROWSERIFY_TRANSFORM_ARGS ?= [ babelify --presets [ es2015 react ] --plugins [ transform-object-rest-spread ] ]
DIST_MODULES := bootstrap bootstrap-material-design jquery snackbarjs

.PHONY: default force clean distclean devserver dev prod watchify

default: devserver

force:

clean:
	rm -rf build

distclean: clean
	rm -rf client/node_modules

devserver: dev build/dev/.work/python/.stamp
	cd build/dev && PYTHONPATH=$$PWD .work/python/bin/python2 livesite/devserver_main.py $(DEVSERVER_ARGS)

dev: build/dev/.stamp

prod: build/prod/.stamp

watchify:
	cd client && node_modules/.bin/watchify js/index.js -t $(BROWSERIFY_TRANSFORM_ARGS) -d -o ../build/dev/.work/bundle.js -v

build/dev/.stamp: build/dev/static/.stamp build/dev/livesite build/dev/demodata build/dev/tools build/dev/requirements.txt
	touch $@

build/dev/static/.stamp: build/dev/static/assets/.stamp build/dev/static/images
	touch $@

build/dev/static/assets/.stamp: $(wildcard client/css/*.css) client/node_modules/.stamp
	rm -rf `dirname $@`
	mkdir -p `dirname $@`
	set -e; for i in $(DIST_MODULES); do mkdir -p build/dev/static/assets/$$i; ln -s ../../../../../client/node_modules/$$i/dist build/dev/static/assets/$$i/; done
	mkdir -p build/dev/static/assets/livesite
	set -e; for i in $(wildcard client/css/*.css); do ln -s ../../../../../$$i build/dev/static/assets/livesite/; done
	ln -s ../../../.work/bundle.js build/dev/static/assets/livesite/
	touch $@

build/dev/static/images:
	mkdir -p `dirname $@`
	ln -s ../../../images $@

build/dev/demodata:
	mkdir -p `dirname $@`
	ln -s ../../demodata $@

build/dev/livesite:
	mkdir -p `dirname $@`
	ln -s ../../server/livesite $@

build/dev/tools:
	mkdir -p `dirname $@`
	ln -s ../../tools $@

build/dev/requirements.txt:
	mkdir -p `dirname $@`
	ln -s ../../server/requirements.txt $@

build/dev/.work/python/.stamp: server/requirements.txt
	[ -d build/dev/.work/python ] || virtualenv build/dev/.work/python
	build/dev/.work/python/bin/pip install -r server/requirements.txt
	touch $@

build/prod/.stamp: build/dev/.stamp $(shell find production -type f) build/prod/.work/bundle.js client/node_modules/.stamp
	mkdir -p `dirname $@`
	rsync -rpLt --delete --exclude='.*' --exclude='*.pyc' --exclude='assets/livesite/bundle.js' build/dev/ build/prod/
	rsync -rpLt --include='.dockerignore' --exclude='.*' production/ build/prod/
	cp build/prod/.work/bundle.js build/prod/static/assets/livesite/bundle.js
	touch $@

build/prod/.work/bundle.js: $(shell find client/js -name '*.js')
	mkdir -p `dirname $@`
	cd client && NODE_ENV=production node_modules/.bin/browserify js/index.js -t $(BROWSERIFY_TRANSFORM_ARGS) -g envify -g uglifyify -o ../build/prod/.work/bundle.js

client/node_modules/.stamp: client/package.json
	cd client && npm install
	touch $@
