#!/bin/bash

cd "$(dirname "$0")/.."

set -ex

sudo docker pull asia.gcr.io/icpcsec/livesite-app:canary
sudo docker pull asia.gcr.io/icpcsec/livesite-nginx:canary
sudo docker tag asia.gcr.io/icpcsec/livesite-app:{canary,prod}
sudo docker tag asia.gcr.io/icpcsec/livesite-nginx:{canary,prod}
gcloud docker push asia.gcr.io/icpcsec/livesite-app:prod
gcloud docker push asia.gcr.io/icpcsec/livesite-nginx:prod

gcloud compute ssh --project=icpcsec livesite-prod '
set -ex
cat > docker-compose.yml
sudo gcloud docker pull asia.gcr.io/icpcsec/livesite-app:prod
sudo gcloud docker pull asia.gcr.io/icpcsec/livesite-nginx:prod
sudo docker-compose up -d --timeout 3 --remove-orphans
' < compose/prod.yaml
