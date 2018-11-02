import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/database';

import { markLoaded, updateContest, updateStandings, updateTeams } from './actions';
import siteconfig from './siteconfig';

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
  return firebase.initializeApp(options);
}

export class FeedsLoader {
  constructor(dispatch) {
    this.dispatch_ = dispatch;
    this.app_ = initializeApp();
    this.db_ = firebase.database(this.app_);

    // TODO: Remove instance name.
    const ref = this.db_.ref('default');
    for (const feed of Object.keys(UPDATE_FUNCS)) {
      ref.child(`feeds/${feed}`).on(
          'value', (snapshot) => this.onUrlUpdate_(feed, snapshot.val()));
    }
  }

  onUrlUpdate_(feed, url) {
    if (!url) {
      return;
    }
    return axios.get(url).then((response) => {
      const data = response.data;
      const updateFunc = UPDATE_FUNCS[feed];
      this.dispatch_(updateFunc(data));
      this.dispatch_(markLoaded(feed));
    });
  }
}
