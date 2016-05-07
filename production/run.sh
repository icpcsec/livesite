#!/bin/bash

exec uwsgi \
  --module=livesite.wsgi_main:app \
  --logto=/dev/null \
  --logger=syslog:livesite \
  --http-socket=8000 \
  --master \
  --workers=$(nproc) \
  "$@"
