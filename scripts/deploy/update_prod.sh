#!/bin/bash

cd "$(dirname "$0")/../.."

set -ex

make prod-image

gcloud docker -- push asia.gcr.io/icpcsec/livesite-app:latest
gcloud docker -- push asia.gcr.io/icpcsec/livesite-nginx:latest

gcloud compute ssh --project=icpcsec --zone=asia-northeast1-c livesite1 --command='
set -ex
cat > docker-compose.yml
gcloud docker -- pull asia.gcr.io/icpcsec/livesite-app:latest
gcloud docker -- pull asia.gcr.io/icpcsec/livesite-nginx:latest
docker-compose -p livesite up -d --timeout 3 --remove-orphans
' < compose/prod.yaml
