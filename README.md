LiveSite
========

Live Website for Programming Contests


Prerequisites
-------------

- Node.js
- Python 3.6+


How to run locally
------------------

Initial setup:

```
$ npm install
$ node_modules/.bin/firebase login
$ node_modules/.bin/firebase use --add
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
