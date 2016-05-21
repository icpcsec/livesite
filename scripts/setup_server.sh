#!/bin/bash

if [[ -z "$@" ]]; then
  echo "usage: $0 <host> <options...>"
  exit 1
fi

cd "$(dirname "$0")/.."

set -ex

gcloud compute ssh "$@" '
if dpkg -l docker-engine > /dev/null 2>&1; then
  exit 0
fi

set -ex
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates < /dev/null
sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
echo "deb https://apt.dockerproject.org/repo debian-jessie main" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt-get update
sudo apt-get install -y docker-engine < /dev/null
'

gcloud compute ssh "$@" 'sudo mkdir -p /opt/livesite /opt/livesite/db'

gcloud compute ssh "$@" 'sudo tee /opt/livesite/nginx.conf' < configs/nginx/nginx.conf

gcloud compute ssh "$@" 'sudo tee /etc/sysctl.d/99-livesite.conf && sudo sysctl -p /etc/sysctl.d/99-livesite.conf' < configs/sysctl/99-livesite.conf

(
  cd configs/docker-compose
  tar cz . | gcloud compute ssh "$@" 'tar xvz'
)

gcloud compute ssh "$@" '
if [[ -f /usr/local/bin/docker-compose ]]; then
  exit 0
fi

set -ex

curl -L https://github.com/docker/compose/releases/download/1.7.1/docker-compose-`uname -s`-`uname -m` > docker-compose
chmod +x docker-compose
sudo cp docker-compose /usr/local/bin/
rm docker-compose
'
