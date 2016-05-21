#!/bin/bash

cd "$(dirname "$0")/.."

set -ex

make prod
sudo docker build -t asia.gcr.io/nya3jp/livesite build/prod
gcloud docker push asia.gcr.io/nya3jp/livesite

gcloud compute ssh livesite-demo "
set -ex

sudo gcloud docker pull asia.gcr.io/nya3jp/livesite

sudo docker-compose -f demo.yaml up -d
"
