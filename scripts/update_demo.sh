#!/bin/bash

cd "$(dirname "$0")/.."

set -ex

gcloud compute ssh --project=nya3jp livesite-demo '
set -ex
cat > docker-compose.yml
sudo gcloud docker pull asia.gcr.io/nya3jp/livesite-app
sudo gcloud docker pull asia.gcr.io/nya3jp/livesite-nginx
sudo docker-compose up -d --timeout 3 --remove-orphans
' < compose/demo.yaml
