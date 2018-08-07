import axios from 'axios';

import { markLoaded, updateContest, updateStandings, updateTeams } from '../actions';

const PAUSE_SECONDS = 20;
const TIME_SCALE = 60;

class ReplayLoader {
  constructor(store) {
    this.store_ = store;
  }

  start() {
    Promise.all([
      axios.get('/replay/contest.json'),
      axios.get('/replay/teams.json'),
      axios.get('/replay/history.json'),
    ]).then((results) => {
      const [contest, teams, history] = results.map((r) => r.data);

      for (let minute = 0; minute < history.length; ++minute) {
        history[minute].minute = minute;
      }

      this.store_.dispatch(updateContest(contest));
      this.store_.dispatch(markLoaded('contest'));

      this.store_.dispatch(updateTeams(teams));
      this.store_.dispatch(markLoaded('teams'));

      this.store_.dispatch(updateStandings(history[0]));
      this.store_.dispatch(markLoaded('standings'));


      for (let minute = 0; minute < history.length; ++minute) {
        setTimeout(() => {
          this.store_.dispatch(updateStandings(history[minute]));
        }, (PAUSE_SECONDS + minute * 60 / TIME_SCALE) * 1000);
      }
    });
  }
}

export default ReplayLoader;
