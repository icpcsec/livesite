import axios from 'axios';
import * as firebase from 'firebase';

import { markLoaded, updateContest, updateStandings, updateTeams } from '../actions';
import siteconfig from '../siteconfig';

const UPDATE_FUNCS = {
  contest: updateContest,
  teams: updateTeams,
  standings: updateStandings,
};

class FirebaseLoader {
  constructor(store) {
    this._store = store;
    this._app = firebase.initializeApp(siteconfig.firebase, 'loader');
    this._db = firebase.database(this._app);
  }

  start() {
    for (let feed of UPDATE_FUNCS.keys()) {
      this._db.ref(`/feeds/${feed}`).on(
          'value', (snapshot) => this.onUrlUpdate_(feed, snapshot.val()));
    }
  }

  onUrlUpdate_(feed, url) {
    return axios.get(url).then((response) => {
      const data = response.data;
      const updateFunc = UPDATE_FUNCS[feed];
      this._store.dispatch(updateFunc(data));
      this._store.dispatch(markLoaded(feed));
    });
  }
}

export default FirebaseLoader;
