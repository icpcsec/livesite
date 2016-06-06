#!/bin/bash

cd "$(dirname "$0")/.."

set -ex

make -C app prod

sudo docker build -t asia.gcr.io/nya3jp/livesite-app app/build/prod
sudo docker build -t asia.gcr.io/nya3jp/livesite-nginx nginx

gcloud docker push asia.gcr.io/nya3jp/livesite-app
gcloud docker push asia.gcr.io/nya3jp/livesite-nginx

gcloud compute ssh --project=nya3jp livesite-canary '
set -ex
cat > docker-compose.yml
sudo gcloud docker pull asia.gcr.io/nya3jp/livesite-app
sudo gcloud docker pull asia.gcr.io/nya3jp/livesite-nginx
sudo docker-compose up -d --timeout 3 --remove-orphans
' < compose/canary.yaml
