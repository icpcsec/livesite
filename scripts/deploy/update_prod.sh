#!/bin/bash

cd "$(dirname "$0")/../.."

set -ex

third_party/google-cloud-sdk/ensure_download.sh

make prod-image

sudo third_party/google-cloud-sdk/bin/gcloud docker -- push asia.gcr.io/icpcsec/livesite-app:latest
sudo third_party/google-cloud-sdk/bin/gcloud docker -- push asia.gcr.io/icpcsec/livesite-nginx:latest

third_party/google-cloud-sdk/bin/gcloud compute ssh --project=icpcsec --zone=asia-northeast1-c livesite --command='
set -ex
cat > docker-compose.yml
sudo gcloud docker -- pull asia.gcr.io/icpcsec/livesite-app:latest
sudo gcloud docker -- pull asia.gcr.io/icpcsec/livesite-nginx:latest
sudo docker-compose -p livesite up -d --timeout 3 --remove-orphans
' < compose/prod.yaml
