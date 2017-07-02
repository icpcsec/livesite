#!/bin/bash

cd "$(dirname "$0")"

set -e

if [[ ! -f bin/gcloud ]]; then
  cd ..
  curl -L 'https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-158.0.0-linux-x86_64.tar.gz' | tar xz
fi
