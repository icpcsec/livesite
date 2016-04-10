import axios from 'axios';

import { updateStandings } from '../actions';

class ProductionStandingsLoader {
  constructor(store) {
    this._store = store;
    this._config = {
      realtimeServer: null,
    };
    this._ws = null;
  }

  start() {
    this.loadConfig().then(() => {
      this.attemptWebSocket();
    });
    // TODO: Poll standings.
    this.loadStandings();
  }

  loadConfig() {
    return axios.get('/api/config.json').then((response) => {
      this._config = response.data;
    });
  }

  attemptWebSocket() {
    if (!window.WebSocket) {
      console.log('realtime: WebSocket not available.');
      return;
    }
    if (!this._config.realtimeServer) {
      console.log('realtime: Realtime server not configured.');
      return;
    }

    const ws = new WebSocket('ws://' + this._config.realtimeServer + '/ws');
    ws.onopen = (e) => {
      console.log('realtime: WebSocket connection established.');
      this._ws = ws;
      ws.onmessage = (e) => {
        this.onRealtimeMessage(JSON.parse(e.data));
      };
      ws.onclose = ws.onerror = (e) => {
        ws.onerror = ws.onclose = undefined;
        this._ws = null;
        console.log('realtime: WebSocket connection closed. Reconnecting...');
        this.attemptWebSocket();
      };
    };
    ws.onerror = (e) => {
      ws.onerror = ws.onclose = undefined;
      console.log('realtime: WebSocket connection failed. Will retry later.');
      setTimeout(() => this.attemptWebSocket(), 3 * 60 * 1000);
    };
  }

  onRealtimeMessage(data) {
    const command = data.command;
    if (command == 'standings_update') {
      this.loadStandings();
    } else if (command == 'reload') {
      location.reload();
    }
  };

  loadStandings() {
    return axios.get('/api/standings.json').then((response) => {
      this.updateStandings(response.data);
    });
  }

  updateStandings(standings) {
    this._store.dispatch(updateStandings(standings));
  }
};

class DemoStandingsLoader {
  constructor(store) {
    this._store = store;
    this._config = null;
    this._nextStandingIndex = null;
  }

  start() {
    this.loadConfig().then(() => {
      setInterval(
        () => { this.loadNextStandings(); },
        this._config.updateInterval);
      this.loadNextStandings();
    });
  }

  loadConfig() {
    return axios.get('/api/demo.json').then((response) => {
      this._config = response.data.demo;
    });
  }

  loadNextStandings() {
    if (this._nextStandingIndex === null) {
      this._nextStandingIndex = this._config.indexStart || 0;
    }
    const nextStandingUrl = this._config.files[this._nextStandingIndex];
    this._nextStandingIndex += this._config.indexStride;
    if (this._nextStandingIndex >= this._config.files.length) {
      this._nextStandingIndex = this._config.indexStart || 0;
    }
    return axios.get(nextStandingUrl).then((response) => {
      this.updateStandings(response.data);
    });
  }

  updateStandings(standings) {
    this._store.dispatch(updateStandings(standings));
  }
};

export const createDefault = (store) => {
  // TODO: Use more graceful way to enable demo mode.
  if (location.search.indexOf('demo') >= 0) {
    return new DemoStandingsLoader(store);
  }
  return new ProductionStandingsLoader(store);
};
