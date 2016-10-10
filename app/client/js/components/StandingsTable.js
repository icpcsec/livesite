import React from 'react';
import { Link } from 'react-router';
import shallowCompare from 'react-addons-shallow-compare';

import FixedRatioThumbnail from './FixedRatioThumbnail';
import * as siteconfig from '../siteconfig';

const DEFAULT_TEAM = {
  id: 'null',
  name: '???',
  university: '???',
  members: [],
};

const computeUniversityRanks = (standings, teamsMap) => {
  const universityToStatuses = {};
  standings.forEach((status) => {
    const team = teamsMap[status.teamId];
    if (team) {
      const { university } = team;
      if (universityToStatuses[university] === undefined) {
        universityToStatuses[university] = [];
      }
      universityToStatuses[university].push(status);
    }
  });
  const universityRanks = {};
  Object.keys(universityToStatuses).forEach((university) => {
    const statuses = universityToStatuses[university];
    statuses.forEach((status, index) => {
      if (index > 0 && status.rank === statuses[index - 1].rank) {
        universityRanks[status.teamId] = universityRanks[statuses[index - 1].teamId];
      } else {
        universityRanks[status.teamId] = `${index + 1}/${statuses.length}`;
      }
    });
  });
  return universityRanks;
};

const LegendProblemCol = ({ problem: { label, title, color = 'black' } }) => {
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

const LegendRowSimple = ({ problems }) => {
  return (
    <li className="team-row legend">
      <table className="team-table">
        <tbody>
          <tr>
            <th className="team-mark"></th>
            <th className="team-rank">#</th>
            <th className="team-solved">正答数</th>
            <th className="team-penalty">時間</th>
            <th className="team-name">チーム</th>
            <th className="team-name">大学</th>
            <th className="team-members">メンバー</th>
          </tr>
        </tbody>
      </table>
    </li>
  );
};

const LegendRowDetailed = ({ problems }) => {
  const problemCols = [];
  if (problems.length > 0) {
    problems.forEach((problem) => {
      problemCols.push(<LegendProblemCol problem={problem} />);
    });
  } else {
    problemCols.push(<th />);
  }
  return (
    <li className="team-row legend">
      <table className="team-table">
        <tbody>
          <tr>
            <th className="team-mark"></th>
            <th className="team-rank">#</th>
            <th className="team-name">{siteconfig.JA ? 'チーム/大学' : 'Team/University'}</th>
            <th className="team-solved">{siteconfig.JA ? '正答数' : 'Solved'}</th>
            {problemCols}
          </tr>
        </tbody>
      </table>
    </li>
  );
};

class TeamCol extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  render() {
    const { text, small, to, ...rest } = this.props;
    const content = <span>{text}<br /><small>{small}</small></span>;
    const inner =
        to ? <Link to={to} className="no-decoration">{content}</Link> : content;
    return <td {...rest}>{inner}</td>;
  }
};

const TeamSolvedCol = ({ solved, numProblems }) => {
  // HACK: Assume 6 problems if there is no problem settings.
  const actualNumProblems = numProblems || 6;
  const backgroundColor =
    solved == 0 ? 'transparent' :
    `hsl(${(actualNumProblems - solved) / (actualNumProblems - 1) * 180}, 80%, 66%)`;
  return (
    <td className="team-solved">
      <div className="team-cell">
        <div className="team-cell-bg" style={{ backgroundColor }} />
        <div className="team-cell-fg">{solved}</div>
      </div>
    </td>
  );
};

const TeamPenaltyCol = ({ penalty }) => (
  <td className="team-penalty">
    <span style={{ fontSize: '8px' }}>({penalty})</span>
  </td>
);

const TeamProblemCol = ({ problem: { attempts, penalty, pendings, solved } }) => {
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
      <div className="team-cell">
        <div className={`team-cell-bg ${status}`} />
        <div className="team-cell-fg">{content}</div>
      </div>
    </td>
  );
};

const TeamPinCol = ({ pinned, onClick }) => {
  const className =
    'glyphicon glyphicon-pushpin' + (pinned ? ' pinned' : '');
  return (
    <td className="team-mark">
      <span className={className} onClick={onClick} />
    </td>
  );
};

const TeamRevealStateCol = ({ revealState }) => (
  <td className="team-mark">
    <span className="glyphicon glyphicon-ok"
          style={{ display: (revealState === 'finalized' ? null : 'none') }} />
  </td>
);

const RevealMarker = () => (
  // .reveal-marker is used to compute the marker position in StandingsRevealTable.
  <div className="reveal-marker" style={{ position: 'relative' }}>
    <div style={{ position: 'absolute', bottom: '1px', boxShadow: '0 0 0 5px red' }}>
      <table className="team-table" style={{ background: 'transparent' }}>
        <tbody>
          <tr>
            <TeamCol text="a" small="b" style={{ opacity: 0 }} />
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const TeamRowSimple = (props) => {
  const { status, team, universityRank, numProblems, pinned, onClickPin, zIndex, className = '', ...rest } = props;
  const { rank, solved, penalty } = status;
  const { id, name, university, members } = team;
  const rewrittenClassName = 'team-row ' + className;
  let membersText = '';
  members.forEach(({ name }) => {
    if (!/^メンバー\s*\d$/.test(name)) {
      if (membersText.length > 0) {
        membersText += ' / ';
      }
      membersText += name;
    }
  });
  const universityText = (
    <span>
      {university}
      <small>{' '}[{universityRank || '???'}]</small>
    </span>
  );
  return (
    <li className={rewrittenClassName} style={{ zIndex }} {...rest}>
      <table className="team-table">
        <tbody>
          <tr>
            <TeamPinCol pinned={pinned} onClick={onClickPin} />
            <TeamCol className="team-rank" text={rank} />
            <TeamSolvedCol solved={solved} numProblems={numProblems} />
            <TeamPenaltyCol penalty={penalty} />
            <TeamCol className="team-name" text={name} to={`/team/${id}`} />
            <TeamCol className="team-name" text={universityText} to={`/team/${id}`} />
            <TeamCol className="team-members" text={membersText} to={`/team/${id}`} />
          </tr>
        </tbody>
      </table>
    </li>
  );
};

const TeamRowDetailed = (props) => {
  const { status, team, numProblems, pinned, onClickPin, revealState, firstRevealFinalized, zIndex, className = '', ...rest } = props;
  const { rank, solved, penalty, problems = [] } = status;
  const { id, name, university, country } = team;
  const rewrittenClassName = 'team-row ' + className;
  const problemCols = [];
  if (problems.length > 0) {
    problems.forEach((problem) => {
      problemCols.push(<TeamProblemCol problem={problem} />);
    });
  } else {
    problemCols.push(<td />);
  }
  const universityWithCountry =
    siteconfig.ENABLE_COUNTRY ?
    <span>
      <img src={`/images/${country}.png`} style={{ width: '19px', height: '12px', marginRight: '3px', marginBottom: '1px' }} />
      {university}
    </span> :
    university;
  const markCol = revealState ?
    <TeamRevealStateCol revealState={revealState} /> :
    <TeamPinCol pinned={pinned} onClick={onClickPin} />;
  const revealMarker = firstRevealFinalized && <RevealMarker />;
  return (
    <li className={rewrittenClassName} style={{ zIndex }} {...rest}>
      {revealMarker}
      <table className="team-table">
        <tbody>
          <tr>
            {markCol}
            <TeamCol className="team-rank" text={rank} />
            <TeamCol className="team-name" text={name} small={universityWithCountry} to={`/team/${id}`} />
            <TeamCol className="team-solved" text={solved} small={`(${penalty})`} />
            {problemCols}
          </tr>
        </tbody>
      </table>
    </li>
  );
};

class AnimatingTeamRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { rankHidden: false, newSolved: false };
    this._timers = new Set();
  }

  setTimeout(callback, timeout) {
    const timer = setTimeout(() => {
      if (this._timers.has(timer)) {
        this._timers.delete(timer);
        callback();
      }
    }, timeout);
    this._timers.add(timer);
  }

  clearTimeouts() {
    this._timers.forEach((timer) => {
      clearTimeout(timer);
    });
    this._timers.clear();
  }

  animateForNewSolve() {
    this.setState({ rankHidden: true, newSolved: true });
    this.setTimeout(() => {
      this.setState({ newSolved: false });
    }, 9000);
    this.setTimeout(() => {
      this.setState({ rankHidden: false });
    }, 4000);
  }

  componentDidUpdate(prevProps) {
    if (this.props.status.solved != prevProps.status.solved) {
      this.animateForNewSolve();
    }
  }

  componentWillUnmount() {
    this.clearTimeouts();
  }

  render() {
    const { component: Component, className = '', status, ...rest } = this.props;
    const rewrittenClassName =
      this.state.newSolved ? className + ' new-solved' : className;
    const rewrittenStatus = Object.assign(
      {}, status, this.state.rankHidden ? {rank: '...'} : {});
    return <Component className={rewrittenClassName} status={rewrittenStatus} {...rest} />
  }
};

class AnimatingList extends React.Component {
  componentWillUpdate() {
    const liList = Array.from(this._dom.children);
    liList.forEach((li) => {
      li.classList.remove('animating');
      li.style.transform = undefined;
    });
    this._lastKeyToOffsetTop = new Map();
    liList.forEach((li, i) => {
      const child = this.props.children[i];
      this._lastKeyToOffsetTop.set(child.key, li.offsetTop);
    });
  }

  componentDidUpdate() {
    const liList = Array.from(this._dom.children);
    const currentKeyToOffsetTop = new Map();
    liList.forEach((li, i) => {
      const child = this.props.children[i];
      currentKeyToOffsetTop.set(child.key, li.offsetTop);
    });
    const rels = new Map();
    liList.forEach((li, i) => {
      const child = this.props.children[i];
      const currentOffsetTop = currentKeyToOffsetTop.get(child.key);
      const lastOffsetTop =
        this._lastKeyToOffsetTop.has(child.key) ?
        this._lastKeyToOffsetTop.get(child.key) :
        currentOffsetTop;
      const relativeOffsetTop = lastOffsetTop - currentOffsetTop;
      rels[child.key] = relativeOffsetTop;
      if (relativeOffsetTop != 0) {
        li.style.transform = `translate(0, ${relativeOffsetTop}px)`;
        setTimeout(() => { li.classList.add('animating') }, 0);
        setTimeout(() => { li.style.transform = 'translate(0, 0)'; }, 1000);
        setTimeout(() => { li.classList.remove('animating'); }, 1000 + 3000);
      }
    });
  }

  render() {
    const { children, style, ...rest } = this.props;
    const rewrittenStyle = Object.assign({}, style, {position: 'relative'});
    return (
      <ul style={rewrittenStyle} {...rest} ref={(dom) => { this._dom = dom; }}>
        {children}
      </ul>
    );
  }
};

class StandingsTable extends React.Component {
  handleClickPin(teamId) {
    this.props.togglePin(teamId);
  }

  render() {
    const { standings, teamsMap, problems, detailed, pinnedTeamIds, revealMode = false } = this.props;
    const pinnedTeamIdSet = new Set(pinnedTeamIds);
    const universityRanks = computeUniversityRanks(standings, teamsMap);
    const TeamRow = detailed ? TeamRowDetailed : TeamRowSimple;
    const LegendRow = detailed ? LegendRowDetailed : LegendRowSimple;
    let seenRevealFinalized = false;
    const normalRows = standings.map((status, index) => {
      const team = teamsMap[status.teamId] || DEFAULT_TEAM;
      const firstRevealFinalized =
        status.revealState === 'finalized' && !seenRevealFinalized && index > 0;
      if (status.revealState === 'finalized') {
        seenRevealFinalized = true;
      }
      // Hack to place reveal marker frontmost.
      const zIndex = status.revealState === 'finalized' ? 10000 : 9999 - index;
      return (
        <AnimatingTeamRow
          component={TeamRow}
          key={status.teamId}
          status={status}
          team={team}
          numProblems={problems.length}
          universityRank={universityRanks[status.teamId]}
          pinned={pinnedTeamIdSet.has(status.teamId)}
          onClickPin={() => this.handleClickPin(status.teamId)}
          revealState={status.revealState}
          firstRevealFinalized={firstRevealFinalized}
          zIndex={zIndex}
        />
      );
    });
    if (revealMode && !seenRevealFinalized) {
      normalRows.push(<li className="team-row" style={{ zIndex: 10000 }}><RevealMarker /></li>);
    }
    const pinnedStandings = standings.filter(
      (status) => pinnedTeamIdSet.has(status.teamId));
    const stickyRows = pinnedStandings.map((status) => {
      const team = teamsMap[status.teamId] || DEFAULT_TEAM;
      return (
        <AnimatingTeamRow
          component={TeamRow}
          key={status.teamId}
          status={status}
          team={team}
          universityRank={universityRanks[status.teamId]}
          numProblems={problems.length}
          pinned={true}
          onClickPin={() => this.handleClickPin(status.teamId)}
          zIndex={0}
          className="sticky"
        />
      );
    });
    return (
      <div className="standings">
        <ul className="list-unstyled">
          <LegendRow problems={problems} />
        </ul>
        <ul className="list-unstyled">
          {stickyRows}
        </ul>
        <AnimatingList className="list-unstyled">
          {normalRows}
        </AnimatingList>
      </div>
    );
  }
};

export default StandingsTable;
