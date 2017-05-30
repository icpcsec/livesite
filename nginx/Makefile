.PHONY: default help dev-image prod-image

default: help

help:
	@echo "Usage: make {help|dev-image|prod-image}"

dev-image: .dev-image.stamp

prod-image: .prod-image.stamp

.dev-image.stamp: $(shell find . -type f -not -name '.*')
	sudo docker build -t asia.gcr.io/icpcsec/livesite-nginx:dev .
	touch $@

.prod-image.stamp: $(shell find . -type f -not -name '.*')
	sudo docker build -t asia.gcr.io/icpcsec/livesite-nginx:latest .
	touch $@
