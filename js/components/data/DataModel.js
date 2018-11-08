import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

import { updateFeeds } from '../../actions';
import siteconfig from '../../siteconfig';

const FEEDS = ['contest', 'standings', 'teams'];

function initializeApp() {
  const options = Object.assign({}, siteconfig.firebase);
  const hostname = window.location.hostname;
  if (hostname === 'localhost') {
    options.authDomain = 'icpcsec.firebaseapp.com';
    options.databaseURL = 'ws://localhost:5001';
  } else if (hostname.endsWith('.firebaseapp.com')) {
    const appName = hostname.split(".")[0];
    options.authDomain = appName + '.firebaseapp.com';
    options.databaseURL = 'https://' + appName + '.firebaseio.com';
  } else {
    throw new Error('Unsupported host: ' + hostname);
  }
  return firebase.initializeApp(options);
}

class DataModel {
  constructor(dispatch) {
    this.dispatch_ = dispatch;
    this.app_ = initializeApp();
    this.db_ = firebase.database(this.app_);

    for (const feed of FEEDS) {
      this.db_.ref(`feeds/${feed}`).on(
          'value', (snapshot) => this.onFeedUpdate_(feed, snapshot.val()));
    }
  }

  async signIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return await firebase.auth().signInWithPopup(provider);
  }

  async onFeedUpdate_(feed, url) {
    if (!url) {
      return;
    }
    const response = await axios.get(url);
    const data = response.data;
    this.dispatch_(updateFeeds({[feed]: {$set: data}}));
  }
}

export default DataModel;
