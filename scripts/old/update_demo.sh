#!/bin/bash

cd "$(dirname "$0")/.."

set -ex

gcloud compute ssh --project=icpcsec livesite-demo '
set -ex
cat > docker-compose.yml
sudo gcloud docker pull asia.gcr.io/icpcsec/livesite-app:demo
sudo gcloud docker pull asia.gcr.io/icpcsec/livesite-nginx:demo
sudo docker-compose up -d --timeout 3 --remove-orphans
' < compose/demo.yaml
