import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';

import FixedRatioThumbnail from './FixedRatioThumbnail';

const DEFAULT_TEAM = {
  id: 'null',
  name: '???',
  university: '???',
  members: [],
};

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

const StandingsLegendRow = ({ problems, detailed }) => {
  const cols = [];
  if (detailed) {
    cols.push(...problems.map(
      (problem) => <StandingsLegendProblemCol problem={problem} />));
  } else {
    cols.push(<th style={{ paddingLeft: '40px' }}>TODO: ここに何を表示するか考える</th>);
  }
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
            <th className="team-name">チーム/大学</th>
            <th className="team-score">スコア</th>
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

/*
const TeamInfoTip = ({ team }) => {
  const memberElements = team.members.map((profile) => (
    <div>
      <FixedRatioThumbnail url={profile.icon} ratio={1} />
      {profile.name}
    </div>
  ));
  return (
    <div className="team-info-tip">
      <h3>{ team.name }</h3>
      <h4>{ team.university }</h4>
      <FixedRatioThumbnail url={team.photo} ratio={1 / 3} />
      <Link to={`/team/${team.id}`}>Details</Link>
    </div>
  );
};
*/

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
    if (this.props.status.solved != prevProps.status.solved) {
      this.animateForNewSolve();
    }
  }

  componentDidMount() {
    /*
    $(this._hover).popover({
      container: 'body',
      placement: 'right',
      trigger: 'focus',
      content: () => {
        const div = document.createElement('div');
        ReactDOM.render(<TeamInfoTip team={this.props.team} />, div);
        return div.innerHTML;
      },
      html: true,
    });
    */
  }

  componentWillUnmount() {
    /*
    $(this._hover).popover('destroy');
    */
  }

  render() {
    const { status, team, pinned, onClickPin, sticky, detailed } = this.props;
    const { rank, solved, penalty, problems } = status;
    const { id, name, university } = team;
    const cols = [];
    if (detailed) {
      cols.push(...problems.map(
        (problem) => <StandingsProblemCol problem={problem} />));
    }
    if (cols.length == 0) {
      cols.push(<td />);
    }
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
              <td className="team-name" ref={(el) => { this._hover = el; }}>
                <Link to={`/team/${id}`} className="no-decoration">
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
    return new Set(serialized.split(','));
  }

  savePins(pinnedTeamIdSet) {
    const serialized = Array.from(pinnedTeamIdSet).join(',');
    localStorage.setItem(this.props.pinLocalStorageName, serialized);
  }

  animateRows(standings, prevStandings) {
    const rows = Array.from(this._ul.children);

    rows.forEach((li, index) => {
      // Reset row offsets first so li.offsetTop indicates the destination.
      li.style.transform = 'translate(0, 0)';
      li.classList.remove('animating');
      li.style.zIndex = 9999 - index;
    });

    const indexToOffsetY = rows.map((li) => li.offsetTop);
    const teamIdToLastIndex = {};
    prevStandings.forEach(
      ({ teamId }, index) => { teamIdToLastIndex[teamId] = index; });
    const indexToLastIndex =
      standings.map(({ teamId }) => teamIdToLastIndex[teamId]);

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
    this.animateRows(this.props.standings, prevProps.standings);
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
    const { standings, teamsMap, problems, detailed } = this.props;
    const normalRows = standings.map((status) => {
      const team = teamsMap[status.teamId] || DEFAULT_TEAM;
      return (
        <StandingsRow
          key={`normal ${status.teamId}`}
          status={status}
          team={team}
          detailed={detailed}
          pinned={this.state.pinnedTeamIdSet.has(status.teamId)}
          onClickPin={() => this.handleClickPin(status.teamId)}
          sticky={false}
        />
      );
    });
    const pinnedStandings = standings.filter(
      (status) => this.state.pinnedTeamIdSet.has(status.teamId));
    const stickyRows = pinnedStandings.map((status) => {
      const team = teamsMap[status.teamId] || DEFAULT_TEAM;
      return (
        <StandingsRow
          key={`sticky ${status.teamId}`}
          status={status}
          team={team}
          detailed={detailed}
          pinned={true}
          onClickPin={() => this.handleClickPin(status.teamId)}
          sticky={true}
        />
      );
    });
    return (
      <div className="standings">
        <ul className="list-unstyled">
          <StandingsLegendRow problems={problems} detailed={detailed} />
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
