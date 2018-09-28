const express = require('express');
const fbserver = require('firebase-server');

const app = express();

const db = {
  default: {
    feeds: {
      contest: "https://storage.googleapis.com/icpcsec/livesite-feeds/default/contest.1530863933383.json",
      standings: "https://storage.googleapis.com/icpcsec/livesite-feeds/default/standings.1530872996003.json",
      teams: "https://storage.googleapis.com/icpcsec/livesite-feeds/default/teams.1530795432341.json",
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

new fbserver(5001, 'localhost', db);
