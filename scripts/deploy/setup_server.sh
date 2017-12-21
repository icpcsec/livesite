#!/bin/bash

if [[ -z "$@" ]]; then
  echo "usage: $0 <host> <options...>"
  exit 1
fi

cd "$(dirname "$0")/../.."

gcloud compute ssh "$@" --command='
set -ex

if ! dpkg -l docker-ce > /dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y apt-transport-https ca-certificates curl gnupg2 software-properties-common < /dev/null
  curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | sudo apt-key add -
  sudo apt-key fingerprint 0EBFCD88
  sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") $(lsb_release -cs) stable"
  sudo apt-get update
  sudo apt-get install -y docker-ce < /dev/null
  sudo gpasswd -a $USER docker
fi

if [[ ! -f /usr/local/bin/docker-compose ]]; then
  curl -L https://github.com/docker/compose/releases/download/1.17.0/docker-compose-`uname -s`-`uname -m` > docker-compose
  chmod +x docker-compose
  sudo cp docker-compose /usr/local/bin/
  rm docker-compose
fi

sudo mkdir -p /opt/livesite /opt/livesite/db
'
