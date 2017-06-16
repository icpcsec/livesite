#!/bin/bash

if [[ -z "$@" ]]; then
  echo "usage: $0 <host> <options...>"
  exit 1
fi

cd "$(dirname "$0")/.."

set -ex

tar cz configs | gcloud compute ssh "$@" '
set -ex

rm -rf .livesite-setup
mkdir .livesite-setup
cd .livesite-setup
tar xvz

if ! dpkg -l docker-engine > /dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y apt-transport-https ca-certificates < /dev/null
  sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
  echo "deb https://apt.dockerproject.org/repo debian-jessie main" | sudo tee /etc/apt/sources.list.d/docker.list
  sudo apt-get update
  sudo apt-get install -y docker-engine < /dev/null
fi

if [[ ! -f /usr/local/bin/docker-compose ]]; then
  curl -L https://github.com/docker/compose/releases/download/1.7.1/docker-compose-`uname -s`-`uname -m` > docker-compose
  chmod +x docker-compose
  sudo cp docker-compose /usr/local/bin/
  rm docker-compose
fi

sudo mkdir -p /opt/livesite /opt/livesite/db

sudo cp configs/sysctl.conf /etc/sysctl.d/99-livesite.conf
sudo sysctl -p /etc/sysctl.d/99-livesite.conf

sudo cp configs/rsyslog.conf /etc/rsyslog.d/99-livesite.conf
sudo service rsyslog restart
'
