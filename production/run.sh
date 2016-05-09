#!/bin/bash

exec uwsgi \
  --module=livesite.wsgi_main:app \
  --lazy-app \
  --logto=/dev/null \
  --logger=syslog:livesite-server \
  --http-socket=:8000 \
  --uwsgi-socket=:9000 \
  --listen=10000 \
  --master \
  --workers=$(( $(nproc) * 2 )) \
  --threads=64 \
  "$@"
