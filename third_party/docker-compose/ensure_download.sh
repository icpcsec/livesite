#!/bin/bash

cd "$(dirname "$0")"

set -e

if [[ ! -f docker-compose ]]; then
  curl -L "https://github.com/docker/compose/releases/download/1.14.0/docker-compose-`uname -s`-`uname -m`" > docker-compose
  chmod 755 docker-compose
fi
