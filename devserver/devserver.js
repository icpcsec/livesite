const express = require('express');
const fbserver = require('firebase-server');

const app = express();

const db = {
  default: {
    feeds: {
      contest: "/demodata/contest.json",
      standings: "/demodata/standings.json",
      teams: "/demodata/teams.json",
    },
  },
};

app.use(express.static('public'));
app.get('*', (req, res) => {
  res.sendFile('index.html', {root: 'public'}, (e) => {
    res.end();
  });
});

app.listen(5000, () => {
  console.log('ready: http://localhost:5000/');
});

new fbserver({port: 5001, rest: true}, 'localhost', db);
