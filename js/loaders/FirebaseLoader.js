import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/database';

import { markLoaded, updateContest, updateStandings, updateTeams } from '../actions';
import siteconfig from '../siteconfig';

const UPDATE_FUNCS = {
  contest: updateContest,
  teams: updateTeams,
  standings: updateStandings,
};

function initializeApp() {
  const options = Object.assign({}, siteconfig.firebase);
  const hostname = window.location.hostname;
  if (hostname === 'localhost') {
    options.databaseURL = 'ws://localhost:5001';
  } else if (hostname.endsWith('.firebaseapp.com')) {
    const appName = hostname.split(".")[0];
    options.databaseURL = 'https://' + appName + '.firebaseio.com';
  } else {
    throw new Error('Unsupported host: ' + hostname);
  }
  return firebase.initializeApp(options, 'loader');
}

class FirebaseLoader {
  constructor(store) {
    this.store_ = store;
    this.app_ = initializeApp();
    this.db_ = firebase.database(this.app_);
    this.ref_ = this.db_.ref('default');
  }

  start() {
    for (let feed of Object.keys(UPDATE_FUNCS)) {
      this.ref_.child(`feeds/${feed}`).on(
          'value', (snapshot) => this.onUrlUpdate_(feed, snapshot.val()));
    }
  }

  onUrlUpdate_(feed, url) {
    return axios.get(url).then((response) => {
      const data = response.data;
      const updateFunc = UPDATE_FUNCS[feed];
      this.store_.dispatch(updateFunc(data));
      this.store_.dispatch(markLoaded(feed));
    });
  }
}

export default FirebaseLoader;
