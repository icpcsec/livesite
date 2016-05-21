#!/bin/bash

cd "$(dirname "$0")/.."

set -ex

make prod
sudo docker build -t asia.gcr.io/nya3jp/livesite build/prod
gcloud docker push asia.gcr.io/nya3jp/livesite

gcloud compute ssh livesite-canary "
set -ex

sudo gcloud docker pull asia.gcr.io/nya3jp/livesite

sudo docker-compose -f canary.yaml up -d
"
