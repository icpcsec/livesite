import axios from 'axios';

import { markLoaded, updateRealtime, updateContest, updateStandings, updateTeams, updateRatings } from '../actions';

const FEEDS = ['contest', 'teams', 'standings', 'ratings'];
const POLLING_INTERVAL_IN_SECONDS = 10;
const UPDATE_FUNCS = {
  contest: updateContest,
  teams: updateTeams,
  standings: updateStandings,
  ratings: updateRatings,
};

class LiveLoader {
  constructor(store) {
    this._store = store;
    this._feedToTs = {};
    this._ws = null;
  }

  start() {
    this.loadAllFeeds();
    this._timer = setInterval(
        () => this.maybePollFeeds(),
        POLLING_INTERVAL_IN_SECONDS * 1000);
    this.attemptWebSocket();
  }

  maybePollFeeds() {
    if (!this._ws) {
      this.loadAllFeeds();
    }
  }

  loadAllFeeds() {
    FEEDS.forEach((feed) => this.loadFeed(feed));
  }

  loadFeed(feed, url = null) {
    const updateFunc = UPDATE_FUNCS[feed];
    if (!updateFunc) {
      return Promise.reject();
    }
    return axios.get(url || `/api/${feed}.json`).then((response) => {
      const data = response.data;
      if (this._feedToTs[feed] === data.ts) {
        return;
      }
      this._feedToTs[feed] = data.ts;
      this._store.dispatch(updateFunc(data.data));
      this._store.dispatch(markLoaded(feed));
    });
  }

  attemptWebSocket() {
    if (!window.WebSocket) {
      this._store.dispatch(updateRealtime(false));
      return;
    }
    const ws = new WebSocket('ws://' + location.host + '/ws/realtime');
    ws.onopen = (e) => {
      this._ws = ws;
      ws.onmessage = (e) => {
        this.onRealtimeMessage(JSON.parse(e.data));
      };
      ws.onclose = ws.onerror = (e) => {
        ws.onerror = ws.onclose = undefined;
        this._ws = null;
        setTimeout(() => this.attemptWebSocket(), 10 * 1000);
        this._store.dispatch(updateRealtime(false));
      };
      this._store.dispatch(updateRealtime(true));
    };
    ws.onerror = (e) => {
      ws.onerror = ws.onclose = undefined;
      setTimeout(() => this.attemptWebSocket(), 3 * 60 * 1000);
      this._store.dispatch(updateRealtime(false));
    };
  }

  onRealtimeMessage(data) {
    if (data.command === 'feeds_update') {
      const feedsMap = data.params.feeds;
      Object.keys(feedsMap).forEach((feed) => {
        const { url, ts } = feedsMap[feed];
        if (this._feedToTs[feed] !== ts) {
          this.loadFeed(feed, url);
        }
      });
    }
  }
};

export default LiveLoader;
