#!/bin/bash

cd "$(dirname "$0")/.."

set -ex

sudo docker pull asia.gcr.io/nya3jp/livesite
sudo docker tag -f asia.gcr.io/nya3jp/livesite asia.gcr.io/icpcsec/livesite
gcloud docker push asia.gcr.io/icpcsec/livesite

gcloud compute ssh --project=icpcsec livesite-prod "
set -ex

sudo gcloud docker pull asia.gcr.io/icpcsec/livesite

sudo docker-compose -f prod.yaml up -d -t 0
"
