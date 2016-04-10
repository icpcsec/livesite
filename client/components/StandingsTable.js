import React from 'react';
import { Link } from 'react-router';

const StandingsLegendProblemCol = ({ problem: { label, title, color = 'black' } }) => {
  return (
    <th className="team-problem">
      <span title={title}>
        {label}
      </span>
      <span className="team-problem-flag">
        <span className="glyphicon glyphicon-flag" style={{ color }} />
      </span>
    </th>
  );
};

const StandingsLegendRow = ({ problems }) => {
  const cols = problems.map(
    (problem) => <StandingsLegendProblemCol problem={problem} />);
  if (cols.length == 0) {
    cols.push(<th />);
  }
  return (
    <li className="team-row legend">
      <table className="team-table">
        <tbody>
          <tr>
            <th className="team-mark">{' '}</th>
            <th className="team-rank">#</th>
            <th className="team-name">Team/University</th>
            <th className="team-score">Solved</th>
            {cols}
          </tr>
        </tbody>
      </table>
    </li>
  );
};

const StandingsProblemCol = ({ problem: { attempts, penalty, pendings, solved } }) => {
  let status;
  let content;
  if (solved) {
    status = 'solved';
    content = (
      <span>
        {attempts}
        <br /><small>({ penalty })</small>
      </span>
    );
  } else {
    if (pendings > 0) {
      status = 'pending';
    } else if (attempts > 0) {
      status = 'rejected';
    } else {
      status = 'unattempted';
    }
    content = (
      <span>
        {attempts}
        <br /><small>&nbsp;</small>
      </span>
    );
  }
  return (
    <td className="team-problem">
      <div className="team-problem-cell">
        <div className={`team-problem-cell-bg ${status}`} />
        <div className="team-problem-cell-fg">{content}</div>
      </div>
    </td>
  );
};

const StandingsRowPin = ({ pinned, onClick }) => {
  const className =
    'glyphicon glyphicon-pushpin' + (pinned ? ' pinned' : '');
  return <span className={className} onClick={onClick} />
};

class StandingsRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { rankHidden: false };
  }

  animateForNewSolve() {
    this._li.classList.add('new-solved');
    setTimeout(() => {
      this._li.classList.remove('new-solved');
    }, 10000);

    this.setState({ rankHidden: true });
    setTimeout(() => {
      this.setState({ rankHidden: false });
    }, 4000);
  }

  componentDidUpdate(prevProps) {
    if (this.props.team.solved != prevProps.team.solved) {
      this.animateForNewSolve();
    }
  }

  render() {
    const { team, pinned, onClickPin, sticky } = this.props;
    const { id, rank, name, university, solved, penalty, problems } = team;
    const cols = problems.map(
      (problem) => <StandingsProblemCol problem={problem} />);
    const displayRank = this.state.rankHidden ? '...' : rank;
    return (
      <li className={`team-row ${sticky ? 'sticky' : ''}`}
          ref={(li) => { this._li = li; }}>
        <table className="team-table">
          <tbody>
            <tr>
              <td className="team-mark">
                <StandingsRowPin pinned={pinned} onClick={onClickPin} />
              </td>
              <td className="team-rank">{displayRank}</td>
              <td className="team-name">
                <Link to={`/team/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {name}
                  <br /><small>{university}</small>
                </Link>
              </td>
              <td className="team-score">
                {solved}
                <br /><small>({penalty})</small>
              </td>
              {cols}
            </tr>
          </tbody>
        </table>
      </li>
    );
  }
};

class StandingsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pinnedTeamIdSet: this.loadPins(),
    }
  }

  setState(nextState) {
    super.setState(nextState);
    const pinnedTeamIdSet = nextState.pinnedTeamIdSet;
    if (pinnedTeamIdSet !== undefined) {
      this.savePins(pinnedTeamIdSet);
    }
  }

  loadPins() {
    const serialized = localStorage.getItem(this.props.pinLocalStorageName);
    if (!serialized || !serialized.length) {
      return new Set();
    }
    return new Set(serialized.split(',').map((s) => parseInt(s, 10)));
  }

  savePins(pinnedTeamIdSet) {
    const serialized = Array.from(pinnedTeamIdSet).join(',');
    localStorage.setItem(this.props.pinLocalStorageName, serialized);
  }

  animateRows(teams, prevTeams) {
    const rows = Array.from(this._ul.children);

    rows.forEach((li, index) => {
      // Reset row offsets first so li.offsetTop indicates the destination.
      li.style.transform = 'translate(0, 0)';
      li.classList.remove('animating');
      li.style.zIndex = 9999 - index;
    });

    const indexToOffsetY = rows.map((li) => li.offsetTop);
    const teamIdToLastIndex = {};
    prevTeams.forEach(({ id }, index) => { teamIdToLastIndex[id] = index; });
    const indexToLastIndex = teams.map(({ id }) => teamIdToLastIndex[id]);

    // Schedule animation.
    rows.forEach((li, index) => {
      const lastIndex = indexToLastIndex[index];
      const relativeOffsetY =
        lastIndex === undefined ?
        0 : indexToOffsetY[lastIndex] - indexToOffsetY[index];
      if (relativeOffsetY != 0) {
        li.style.transform = `translate(0, ${relativeOffsetY}px)`;
        setTimeout(() => {
          li.classList.add('animating');
          li.style.transform = 'translate(0, 0)';
        }, 1000);
      }
    });
  }

  componentDidUpdate(prevProps) {
    this.animateRows(this.props.standings.teams, prevProps.standings.teams);
  }

  handleClickPin(id) {
    const newPinnedTeamIdSet = new Set(this.state.pinnedTeamIdSet);
    if (this.state.pinnedTeamIdSet.has(id)) {
      newPinnedTeamIdSet.delete(id);
    } else {
      newPinnedTeamIdSet.add(id);
    }
    this.setState({pinnedTeamIdSet: newPinnedTeamIdSet});
  }

  render() {
    const { teams, problems } = this.props.standings;
    const normalRows = teams.map((team) => (
      <StandingsRow
        key={`normal ${team.id}`}
        team={team}
        pinned={this.state.pinnedTeamIdSet.has(team.id)}
        onClickPin={() => this.handleClickPin(team.id)}
        sticky={false}
      />
    ));
    const pinnedTeams =
      teams.filter((team) => this.state.pinnedTeamIdSet.has(team.id));
    const stickyRows = pinnedTeams.map((team) => (
      <StandingsRow
        key={`sticky ${team.id}`}
        team={team}
        pinned={true}
        onClickPin={() => this.handleClickPin(team.id)}
        sticky={true}
      />
    ));
    return (
      <div className="standings">
        <ul className="list-unstyled">
          <StandingsLegendRow problems={problems} />
        </ul>
        <ul className="list-unstyled">
          {stickyRows}
        </ul>
        <ul className="list-unstyled"
            ref={(ul) => { this._ul = ul; }}>
          {normalRows}
        </ul>
      </div>
    );
  }
};

StandingsTable.defaultProps = {
  pinLocalStorageName: 'pinnedTeams',
};

export default StandingsTable;
