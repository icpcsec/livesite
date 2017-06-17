#!/bin/bash

exec uwsgi \
  --module=livesite.wsgi_main:app \
  --lazy-app \
  --logto=/dev/null \
  --logger=syslog:livesite-server \
  --http-socket=:8080 \
  --listen=128 \
  --master \
  --workers=$(( $(nproc) * 2 )) \
  --threads=64 \
  "$@"
