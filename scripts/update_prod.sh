#!/bin/bash

cd "$(dirname "$0")/.."

set -ex

sudo docker pull asia.gcr.io/nya3jp/livesite-app
sudo docker pull asia.gcr.io/nya3jp/livesite-nginx
sudo docker tag -f asia.gcr.io/{nya3jp,icpcsec}/livesite-app
sudo docker tag -f asia.gcr.io/{nya3jp,icpcsec}/livesite-nginx
gcloud docker push asia.gcr.io/icpcsec/livesite-app
gcloud docker push asia.gcr.io/icpcsec/livesite-nginx

gcloud compute ssh --project=icpcsec livesite-prod '
set -ex
cat > docker-compose.yml
sudo gcloud docker pull asia.gcr.io/icpcsec/livesite-app
sudo gcloud docker pull asia.gcr.io/icpcsec/livesite-nginx
sudo docker-compose up -d --timeout 3 --remove-orphans
' < compose/prod.yaml
