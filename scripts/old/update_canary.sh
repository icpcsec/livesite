#!/bin/bash

cd "$(dirname "$0")/.."

set -ex

make -C app prod

sudo docker build -t asia.gcr.io/icpcsec/livesite-app:canary app/build/prod
sudo docker build -t asia.gcr.io/icpcsec/livesite-nginx:canary nginx

gcloud docker push asia.gcr.io/icpcsec/livesite-app:canary
gcloud docker push asia.gcr.io/icpcsec/livesite-nginx:canary

gcloud compute ssh --project=icpcsec livesite-canary '
set -ex
cat > docker-compose.yml
sudo gcloud docker pull asia.gcr.io/icpcsec/livesite-app:canary
sudo gcloud docker pull asia.gcr.io/icpcsec/livesite-nginx:canary
sudo docker-compose up -d --timeout 3 --remove-orphans
' < compose/canary.yaml
