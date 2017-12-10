#!/bin/bash

cd "$(dirname "$0")/../.."

set -ex

third_party/google-cloud-sdk/ensure_download.sh

make prod-image

third_party/google-cloud-sdk/bin/gcloud docker -- push asia.gcr.io/icpcsec/livesite-app:latest
third_party/google-cloud-sdk/bin/gcloud docker -- push asia.gcr.io/icpcsec/livesite-nginx:latest

third_party/google-cloud-sdk/bin/gcloud compute ssh --project=icpcsec --zone=asia-northeast1-c livesite-prod --command='
set -ex
cat > docker-compose.yml
gcloud docker -- pull asia.gcr.io/icpcsec/livesite-app:latest
gcloud docker -- pull asia.gcr.io/icpcsec/livesite-nginx:latest
docker-compose -p livesite up -d --timeout 3 --remove-orphans
' < compose/prod.yaml
