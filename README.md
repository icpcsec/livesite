LiveSite
========

Live Website for Programming Contests


Prerequisites
-------------

- Node.js
- Python 3.6+
- Google Account and Google Cloud Platform project


How to run locally
------------------

Initial setup:

```
$ npm install
$ node_modules/.bin/firebase login      # Login with Google Account
$ node_modules/.bin/firebase use --add  # Choose a GCP project and give it any alias
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
