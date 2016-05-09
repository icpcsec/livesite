import axios from 'axios';

import { markLoaded, updateContest, updateStandings, updateTeams } from '../actions';

const FEEDS = ['contest', 'teams', 'standings'];
const POLLING_INTERVAL_IN_SECONDS = 60;
const UPDATE_FUNCS = {
  contest: updateContest,
  teams: updateTeams,
  standings: updateStandings,
};

class LiveLoader {
  constructor(store) {
    this._store = store;
    this._feedToTs = {};
  }

  start() {
    this.loadAllFeeds();
    this._timer = setInterval(
        () => this.loadAllFeeds(),
        POLLING_INTERVAL_IN_SECONDS * 1000);
  }

  loadAllFeeds() {
    FEEDS.forEach((feed) => this.loadFeed(feed));
  }

  loadFeed(feed) {
    const updateFunc = UPDATE_FUNCS[feed];
    if (!updateFunc) {
      return Promise.reject();
    }
    return axios.get(`/api/${feed}.json`).then((response) => {
      const data = response.data;
      if (this._feedToTs[feed] === data.ts) {
        return;
      }
      this._feedToTs[feed] = data.ts;
      if (data.data === null) {
        // TODO: Set visible message
        console.log('The server returned empty feed. Contact admin to initialize the database.');
        return;
      }
      this._store.dispatch(updateFunc(data.data));
      this._store.dispatch(markLoaded(feed));
    });
  }
};

export default LiveLoader;
