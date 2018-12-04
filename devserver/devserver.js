const childProcess = require('child_process');
const express = require('express');
const fbserver = require('firebase-server');

const app = express();

const db = {
  broadcast: {
    'view': 'normal',
    'page': -1,
  },
  feeds: {
    contest: "/demodata/contest.json",
    standings: "/demodata/standings.json",
    teams: "/demodata/teams.json",
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

childProcess.spawn('npm', ['run', 'watch'], {stdio: 'inherit'});
