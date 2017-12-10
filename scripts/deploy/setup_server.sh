#!/bin/bash

if [[ -z "$@" ]]; then
  echo "usage: $0 <host> <options...>"
  exit 1
fi

cd "$(dirname "$0")/../.."

third_party/google-cloud-sdk/ensure_download.sh

third_party/google-cloud-sdk/bin/gcloud compute ssh "$@" --command='
set -ex

if ! dpkg -l docker-engine > /dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y apt-transport-https ca-certificates < /dev/null
  sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
  echo "deb https://apt.dockerproject.org/repo debian-jessie main" | sudo tee /etc/apt/sources.list.d/docker.list
  sudo apt-get update
  sudo apt-get install -y docker-engine < /dev/null
  sudo gpasswd -a $USER docker
fi

if [[ ! -f /usr/local/bin/docker-compose ]]; then
  curl -L https://github.com/docker/compose/releases/download/1.14.0/docker-compose-`uname -s`-`uname -m` > docker-compose
  chmod +x docker-compose
  sudo cp docker-compose /usr/local/bin/
  rm docker-compose
fi

sudo mkdir -p /opt/livesite /opt/livesite/db
'
