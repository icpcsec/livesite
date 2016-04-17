import axios from 'axios';

import { updateTeams } from '../actions';

class TeamsLoader {
  constructor(store) {
    this._store = store;
  }

  start() {
    this.loadTeams();
  }

  loadTeams() {
    return axios.get('/api/teams.json').then((response) => {
      this._store.dispatch(updateTeams(response.data.teams));
    });
  }
};

export default TeamsLoader;
