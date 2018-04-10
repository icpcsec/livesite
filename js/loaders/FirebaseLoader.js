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
    this.store_ = store;
    this.app_ = firebase.initializeApp(siteconfig.firebase, 'loader');
    this.db_ = firebase.database(this.app_);
  }

  start() {
    for (let feed of Object.keys(UPDATE_FUNCS)) {
      this.db_.ref(`/feeds/${feed}`).on(
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
