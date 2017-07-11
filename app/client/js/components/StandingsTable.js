import React from 'react';

import { LegendRowFull, TeamRowFull } from './StandingsTableFull';
import { LegendRowMedium, TeamRowMedium } from './StandingsTableMedium';
import { LegendRowThin, TeamRowThin } from './StandingsTableThin';

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
    }, this.props.revealMode ? 4000 : 9000);
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
    return <Component className={rewrittenClassName} status={rewrittenStatus} {...rest} />;
  }
}

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
        setTimeout(() => { li.classList.add('animating'); }, 0);
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
}

const selectRowClasses = (problems, standings) => {
  if (problems.length > 0 &&
      standings.length > 0 &&
      Array.isArray(standings[0].problems) &&
      standings[0].problems.length > 0) {
    if (typeof standings[0].problems[0].attempts === 'number') {
      return { LegendRow: LegendRowFull, TeamRow: TeamRowFull };
    }
    return { LegendRow: LegendRowMedium, TeamRow: TeamRowMedium };
  }
  return { LegendRow: LegendRowThin, TeamRow: TeamRowThin };
};

class StandingsTable extends React.Component {
  handleClickPin(teamId) {
    this.props.togglePin(teamId);
  }

  render() {
    const { standings, teamsMap, problems, pinnedTeamIds, revealMode = false } = this.props;
    const pinnedTeamIdSet = new Set(pinnedTeamIds);
    const universityRanks = computeUniversityRanks(standings, teamsMap);
    const { LegendRow, TeamRow } = selectRowClasses(problems, standings);
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
          revealMode={revealMode}
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
}

export default StandingsTable;
