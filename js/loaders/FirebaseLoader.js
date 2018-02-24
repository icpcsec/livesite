import axios from 'axios';
import * as firebase from 'firebase';

import { markLoaded, updateContest, updateStandings, updateTeams } from '../actions';

const FEEDS = ['contest', 'teams', 'standings'];
const UPDATE_FUNCS = {
  contest: updateContest,
  teams: updateTeams,
  standings: updateStandings,
};

class FirebaseLoader {
  constructor(store) {
    this._store = store;
    this._app = firebase.initializeApp({
      apiKey: 'AIzaSyDAplg3phAg4pO0gkZO2THZEx9iceyT0tI',
      authDomain: 'icpcsec.firebaseapp.com',
      databaseURL: 'https://icpcsec.firebaseio.com',
      projectId: 'icpcsec',
      storageBucket: 'icpcsec.appspot.com',
      messagingSenderId: '880347634771',
    }, 'loader');
    this._db = firebase.database(this._app);
  }

  start() {
    for (let feed of FEEDS) {
      this._db.ref(`/feeds/${feed}`).on('value', (snapshot) => this.onUrlUpdate_(feed, snapshot.val()));
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
