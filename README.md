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


Prerequisites
-------------

- Node.js


How to run locally
------------------

Initial setup:

```
$ npm install  # install dependencies
$ node_modules/.bin/firebase login  # optional; if write-access is needed
```

Build the JS bundle:

```
$ npm run build  # one-off production build, or
$ npm run watch  # continuous debug build
```

Run the development server:

```
$ npm run serve
```
