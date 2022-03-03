// Copyright 2019 LiveSite authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import applyPartialUpdate from 'immutability-helper';

import { updateBroadcast, updateFeeds } from '../../actions';
import { BroadcastState } from '../../reducers/broadcast';
import { AppDispatch } from '../../redux';
import siteconfig from '../../siteconfig';
import { TopLevelUpdate } from '../../utils';

const FEEDS = ['contest', 'standings', 'teams'];

type Options = {
  apiKey: string;
  authDomain: string;
  messagingSenderId: string;
  databaseURL: string;
};

function initializeApp(): firebase.app.App {
  const hostname = window.location.hostname;
  let options: Options;
  if (hostname === 'localhost') {
    options = {
      ...siteconfig.firebase,
      authDomain: 'icpcsec.firebaseapp.com',
      databaseURL: 'http://localhost:9000?ns=fake-server',
    };
  } else if (hostname.endsWith('.firebaseapp.com')) {
    const appName = hostname.split('.')[0];
    options = {
      ...siteconfig.firebase,
      databaseURL: 'https://' + appName + '.firebaseio.com',
      authDomain: appName + '.firebaseapp.com',
    };
  } else {
    throw new Error('Unsupported host: ' + hostname);
  }
  return firebase.initializeApp(options);
}

const VIEW_VALUES = ['none', 'normal', 'detailed', 'problems'] as const;

type BroadcastData = {
  view?: string;
};

class DataModel {
  private readonly app_: firebase.app.App;
  private readonly db_: firebase.database.Database;
  private readonly auth_: firebase.auth.Auth;

  constructor(private readonly dispatch: AppDispatch) {
    this.app_ = initializeApp();
    this.db_ = firebase.database(this.app_);
    this.auth_ = firebase.auth(this.app_);

    for (const feed of FEEDS) {
      this.db_
        .ref(`feeds/${feed}`)
        .on('value', (snapshot) => this.onFeedUpdate(feed, snapshot.val()));
    }
    this.db_.ref('broadcast').on('value', (snapshot) => {
      const broadcast = snapshot.val() as BroadcastData | null;
      if (broadcast) {
        const update: TopLevelUpdate<BroadcastState> = {};
        if (
          broadcast.view &&
          (VIEW_VALUES as readonly string[]).includes(broadcast.view)
        ) {
          update.view = { $set: broadcast.view as typeof VIEW_VALUES[number] };
        }
        this.dispatch(updateBroadcast(update));
      }
    });

    this.auth_.onAuthStateChanged((user) => {
      const signedIn = !!user;
      this.dispatch(updateBroadcast({ signedIn: { $set: signedIn } }));
    });
  }

  async signIn(): Promise<void> {
    const provider = new firebase.auth.GoogleAuthProvider();
    await this.auth_.signInWithPopup(provider);
  }

  async signOut(): Promise<void> {
    await this.auth_.signOut();
  }

  updateBroadcast(update: TopLevelUpdate<BroadcastState>) {
    const ref = this.db_.ref('broadcast');
    ref.once('value', (snapshot) => {
      const broadcast = applyPartialUpdate(snapshot.val() ?? {}, update);
      ref.set(broadcast);
    });
  }

  private async onFeedUpdate(feed: string, url: string): Promise<void> {
    if (!url) {
      return;
    }
    const response = await axios.get(url);
    const data = response.data;
    this.dispatch(updateFeeds({ [feed]: { $set: data } }));
  }
}

export default DataModel;
