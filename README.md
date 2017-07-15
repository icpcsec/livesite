LiveSite
========

```
 _     _           _____ _ _
| |   (_)         /  ___(_) |
| |    ___   _____\ `--. _| |_ ___
| |   | \ \ / / _ \`--. \ | __/ _ \
| |___| |\ V /  __/\__/ / | ||  __/
\_____/_| \_/ \___\____/|_|\__\___|
```

Requirements
------------

- GNU make
- Docker (`sudo` is automatically used to run docker commands)

How to run locally
------------------

```
$ make up
```

It takes a while to build JavaScript bundles. After the server is ready,
you can access the local instance at `http://localhost:8888/`.

`docker` is run with `sudo` to build a dev image and new containers will be
brought up with `docker-compose`.

Type Ctrl+C to stop.

Directory layout
----------------

```
app/              ... Main application
  bin/            ... Entry point scripts and binaries
  build/          ... Build artifact directory (git-ignored)
  client/         ... Client-side codes
    css/          ... CSS
    js/           ... Client-side JavaScript codes!
    node_modules/ ... npm modules (git-ignored)
    third_party/  ... Third-party libraries not available on npm
  docker/         ... Dockerfiles
  images/         ... Image files
  server/         ... Server-side codes
  siteconfig/     ... Site-specific configuration files
compose/          ... docker-compose configs
data/             ... Past data archive
nginx/            ... Nginx configurations
scrapers/         ... Standings scrapers
scripts/          ... Management scripts
  deploy/         ...   for deployments
  init/           ...   for initializations
  old/            ...   unorganized
third_party/      ... Third-party dependencies
```
