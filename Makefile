.PHONY: default help clean distclean up down dev-image prod-image

default: help

help:
	@echo "Usage: make {help|clean|distclean|up|down|dev-image|prod-image}"

clean:
	$(MAKE) -C app clean

distclean:
	$(MAKE) -C app distclean

up: dev-image
	python -m compose -f compose/dev.yaml -p livesite up --remove-orphans

down:
	python -m compose -f compose/dev.yaml -p livesite down --remove-orphans --volumes

dev-image:
	$(MAKE) -C app dev-image
	$(MAKE) -C nginx dev-image

prod-image:
	$(MAKE) -C app prod-image
	$(MAKE) -C nginx prod-image
