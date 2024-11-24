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
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database, ref, onValue } from 'firebase/database';

import { updateFeeds } from '../../actions';
import { AppDispatch } from '../../redux';
import siteconfig from '../../siteconfig';

const FEEDS = ['contest', 'standings', 'teams'];

type Options = {
  apiKey: string;
  authDomain: string;
  messagingSenderId: string;
  databaseURL: string;
};

function initApp() {
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
  return initializeApp(options);
}

class DataModel {
  private readonly app_: FirebaseApp;
  private readonly db_: Database;

  constructor(private readonly dispatch: AppDispatch) {
    this.app_ = initApp();
    this.db_ = getDatabase(this.app_);

    for (const feed of FEEDS) {
      onValue(ref(this.db_, `feeds/${feed}`), (snapshot) =>
        this.onFeedUpdate(feed, snapshot.val())
      );
    }
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
