import axios from 'axios';

import { markLoaded, updateContest, updateStandings, updateTeams } from '../actions';

class LiveLoader {
  constructor(store) {
    this._store = store;
  }

  start() {
    this.loadFeed('contest');
    this.loadFeed('teams');
    this.loadFeed('standings');
    // TODO: poll feeds
  }

  loadFeed(feed) {
    let updateFunc;
    if (feed == 'contest') {
      updateFunc = updateContest;
    } else if (feed == 'teams') {
      updateFunc = updateTeams;
    } else if (feed == 'standings') {
      updateFunc = updateStandings;
    } else {
      return Promise.reject();
    }
    // TODO: Set ?ts=
    return axios.get(`/api/${feed}.json`).then((response) => {
      const data = response.data;
      if (data.cached) {
        return;
      }
      if (data.data === null) {
        // TODO: Set visible message
        console.log('The server returned empty feed. Contact admin to initialize the database.');
      } else {
        this._store.dispatch(updateFunc(data.data, data.ts));
        this._store.dispatch(markLoaded(feed));
      }
    });
  }
};

export default LiveLoader;
