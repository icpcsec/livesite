import deepEqual from 'deep-equal';
import React from 'react';
import { Link } from 'react-router';
import deepCompare from 'react-addons-deep-compare';
import { sprintf } from 'sprintf-js';

import { tr } from '../i18n';
import siteconfig from '../siteconfig';
import TimerSet from '../utils/TimerSet';

const DEFAULT_TEAM = {
  id: 'null',
  name: '???',
  university: '???',
  members: [],
};

const achievementColor = (solved, numProblems) => {
  // HACK: Assume 8 problems if there is no problem settings.
  const actualNumProblems = numProblems || 8;
  solved = parseInt(solved);

  if (solved === 0) {
    return '#eee';
  }
  // Range is 180...-90
  const hue = 180 - (solved - 1) / (actualNumProblems - 1) * 270;
  return `hsl(${hue}, 80%, 55%)`;
};

class TeamGenericCol extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return deepCompare(this, nextProps, nextState);
  }

  render() {
    const { text, small, to, className = '', ...rest } = this.props;
    const rewrittenClassName = 'team-col ' + className;
    const content = <span>{text}<br /><small>{small}</small></span>;
    const inner =
        to ? <Link to={to} className="no-decoration">{content}</Link> : content;
    return <div className={rewrittenClassName} {...rest}>{inner}</div>;
  }
}

const LegendProblemCol = ({ problem: { label, title, color = 'black' } }) => {
  return (
    <div className="team-col team-problem">
      <div>
        <span title={title}>
          {label}
        </span>
        <span className="team-problem-flag">
          <i className="fas fa-flag d-none d-md-inline" style={{ color }} />
        </span>
      </div>
    </div>
  );
};

class LegendProblemCols extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return deepCompare(this, nextProps, nextState);
  }

  render() {
    const { problems } = this.props;
    const problemCols = problems.map((problem, i) => (
      <LegendProblemCol key={i} problem={problem} />
    ));
    return (
      <div className="team-problems">
        { problemCols }
      </div>
    );
  }
}

const LegendRow = ({ problems }) => {
  return (
    <div className="team-row legend">
      <div className="team-col team-mark"></div>
      <div className="team-col team-rank">#</div>
      <div className="team-col team-score">{tr('Solved', '正答数')}</div>
      <div className="team-col team-name">{tr('Team', 'チーム')}</div>
      <div className="team-col team-univ">{tr('University', '大学')}</div>
      <LegendProblemCols problems={problems} />
    </div>
  );
};

const TeamPinCol = ({ pinned, onClick, revealMode }) => {
  if (revealMode) {
    return <div />;
  }
  const className =
    'fas fa-thumbtack' + (pinned ? ' pinned' : '');
  return (
    <div className="team-col team-mark">
      <i className={className} onClick={onClick} />
    </div>
  );
};

const TeamRevealStateCol = ({ revealMode, revealState }) => {
  if (!revealMode) {
    return <div />;
  }
  const mark = revealState === 'finalized' && <span className="fas fa-check" />;
  return <div className="team-col team-mark">{mark}</div>;
};

const TeamScoreCol = ({ solved, penalty, problemSpecs }) => {
  const backgroundColor = achievementColor(solved, problemSpecs.length);
  return (
    <div className="team-col team-score">
      <div className="team-col-bg" style={{ backgroundColor }} />
      <div className="team-col-fg">
        {solved}
        { /* <br/><small className="d-none d-md-inline">({penalty}) </small> */ }
      </div>
    </div>
  );
};

const TeamProblemCol = ({ minute, problem: { attempts, penalty, pendings, solved } }) => {
  let status;
  let recent = '';
  const content = (
    <small>
      { attempts > 0 ? <span>+{ attempts }</span> : '-' }
    </small>
  );
  if (solved) {
    status = 'solved';
    if (minute - Math.ceil(penalty / 60) < 5) {
      recent = 'recent';
    }
  } else {
    if (pendings > 0) {
      status = 'pending';
    } else if (attempts > 0) {
      status = 'rejected';
    } else {
      status = 'unattempted';
    }
  }
  return (
    <div className={`team-col team-problem ${recent}`}>
      <div className={`team-col-bg ${status}`} />
      <div className="team-col-fg">{content}</div>
    </div>
  );
};

const TeamProblemCols = ({ minute, problems }) => {
  const problemCols = problems.map((problem, i) => (
    <TeamProblemCol key={i} problem={problem} minute={minute} />
  ));
  return (
    <div className="team-problems">
      { problemCols }
    </div>
  );
};

class TeamRowLeft extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const FIELDS = ['pinned', 'revealMode', 'revealState'];
    const cached = FIELDS.every((f) => deepEqual(this.props[f], nextProps[f]));
    return !cached;
  }

  render() {
    const { pinned, revealMode, revealState, onClickPin } = this.props;
    return (
      <div className="team-left">
        <TeamRevealStateCol revealMode={revealMode} revealState={revealState} />
        <TeamPinCol revealMode={revealMode} pinned={pinned} onClick={onClickPin} />
      </div>
    );
  }
}

class TeamRowRight extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return deepCompare(this, nextProps, nextState);
  }

  render() {
    const { minute, solved, penalty, problemSpecs, team, problems } = this.props;
    const { id, name, university } = team;
    return (
      <div className="team-right">
        <TeamScoreCol solved={solved} penalty={penalty} problemSpecs={problemSpecs} />
        <TeamGenericCol className="team-name" text={name} />
        <TeamGenericCol className="team-univ" text={university} />
        <TeamProblemCols problems={problems} minute={minute} />
      </div>
    );
  }
}

class TeamRow extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const FIELDS = ['status', 'team', 'problems', 'pinned', 'zIndex', 'className'];
    const cached = FIELDS.every((f) => deepEqual(this.props[f], nextProps[f]));
    return !cached;
  }

  render() {
    const { minute, index, status, team, problems: problemSpecs, pinned, onClickPin, revealMode, zIndex, className = '' } = this.props;
    const { rank, solved, penalty, revealState, problems = [] } = status;
    const rewrittenClassName = 'team-row ' + className;
    const skip = index >= 80;
    if (skip) {
      return <div />;
    }
    return (
      <div className={rewrittenClassName} style={{ zIndex }}>
        { /* <TeamRowLeft pinned={pinned} revealMode={revealMode} revealState={revealState} onClickPin={onClickPin} /> */ }
        <TeamGenericCol className="team-rank" text={rank} />
        <TeamRowRight solved={solved} penalty={penalty} problemSpecs={problemSpecs} team={team} problems={problems} minute={minute} />
      </div>
    );
  }
}

const RevealRow = (props) => (
  // .reveal-marker is used to compute the marker position in StandingsRevealTable.
  <div className="reveal-row">
    <TeamRow {...props} />
    <div className="reveal-marker" />
  </div>
);

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
    this.state = { rankHidden: false, newSolved: 0 };
    this._timers = new TimerSet();
  }

  animateForNewSolve() {
    this.setState({ newSolved: this.state.newSolved + 1 });
    this._timers.setTimeout(() => {
      this.setState({ newSolved: this.state.newSolved - 1 });
    }, 5000);
    // this._timers.setTimeout(() => {
    //   this.setState({ rankHidden: false });
    // }, 4000);
  }

  componentDidUpdate(prevProps) {
    if (this.props.status.solved !== prevProps.status.solved) {
      this.animateForNewSolve();
    }
  }

  componentWillUnmount() {
    this._timers.clearTimeouts();
  }

  render() {
    const { component: Component, className = '', status, ...rest } = this.props;
    const rewrittenClassName =
      this.state.newSolved > 0 ? className + ' new-solved' : className;
    const rewrittenStatus = Object.assign(
      {}, status, this.state.rankHidden ? {rank: '...'} : {});
    return <Component className={rewrittenClassName} status={rewrittenStatus} {...rest} />;
  }
}

class AnimatingList extends React.Component {
  constructor(props) {
    super(props);
    this.timers_ = new TimerSet();
  }

  componentWillUpdate() {
    const rows = Array.from(this._dom.children);

    // Cancel all animations.
    this.timers_.clearTimeouts();
    rows.forEach((row) => {
      row.classList.remove('animating');
      row.style.transform = null;
    });

    // Record the previous row positions.
    this._lastKeyToOffsetTop = new Map();
    rows.forEach((row, i) => {
      const child = this.props.children[i];
      this._lastKeyToOffsetTop.set(child.key, row.offsetTop);
    });
  }

  componentDidUpdate() {
    const rows = Array.from(this._dom.children);

    // Currently all rows are in the final position. Record all positions.
    const currentKeyToOffsetTop = new Map();
    rows.forEach((row, i) => {
      const child = this.props.children[i];
      // The following line will cause forced relayout, but it is expected.
      currentKeyToOffsetTop.set(child.key, row.offsetTop);
    });

    // Schedule animations.
    rows.forEach((row, i) => {
      const child = this.props.children[i];
      const currentOffsetTop = currentKeyToOffsetTop.get(child.key);
      const lastOffsetTop =
        this._lastKeyToOffsetTop.has(child.key) ?
        this._lastKeyToOffsetTop.get(child.key) :
        currentOffsetTop;
      const relativeOffsetTop = lastOffsetTop - currentOffsetTop;
      if (relativeOffsetTop !== 0) {
        row.style.transform = `translate(0, ${relativeOffsetTop}px)`;
        const animationDelay = row.classList.contains('reveal-row') ? 0 : 100;
        this.timers_.setTimeout(() => {
          row.classList.add('animating');
          row.style.transform = 'translate(0, 0)';
        }, animationDelay);
      }
    });
  }

  componentWillUnmount() {
    this.timers_.clearTimeouts();
  }

  render() {
    const { children, ...rest } = this.props;
    return (
      <div {...rest} ref={(dom) => { this._dom = dom; }}>
        {children}
      </div>
    );
  }
}

class StandingsTableImpl extends React.Component {
  handleClickPin(teamId) {
    this.props.togglePin(teamId);
  }

  render() {
    const { minute, standings, teamsMap, problems, pinnedTeamIds, offsetRows, revealMode = false } = this.props;
    const pinnedTeamIdSet = new Set(pinnedTeamIds);
    const universityRanks = computeUniversityRanks(standings, teamsMap);
    const normalRows = [];
    for (let index = 0; index < standings.length; ++index) {
      const status = standings[index];
      const team = teamsMap[status.teamId] || DEFAULT_TEAM;
      const revealCurrent =
          revealMode &&
          ((index + 1 < standings.length &&
            status.revealState !== 'finalized' &&
            standings[index + 1].revealState === 'finalized') ||
           (index === standings.length - 1 &&
            status.revealState !== 'finalized'));
      if (revealCurrent) {
        // FIXME: Reveal marker broken
        normalRows.push(
          <AnimatingTeamRow
            component={RevealRow}
            key={'__reveal_marker__'}
            status={status}
            team={team}
            problems={problems}
            universityRank={universityRanks[status.teamId]}
            pinned={false}
            revealMode={revealMode}
          />);
      }
      normalRows.push(
        <AnimatingTeamRow
          component={TeamRow}
          key={status.teamId}
          status={status}
          team={team}
          problems={problems}
          universityRank={universityRanks[status.teamId]}
          pinned={pinnedTeamIdSet.has(status.teamId)}
          onClickPin={() => this.handleClickPin(status.teamId)}
          revealMode={revealMode}
          zIndex={9999 - index}
          index={index}
          minute={minute}
        />
      );
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
          problems={problems}
          pinned={true}
          onClickPin={() => this.handleClickPin(status.teamId)}
          zIndex={0}
          className="sticky"
        />
      );
    });
    return (
      <div className="standings">
        { /*
        <div className="standings-section list-unstyled">
          <LegendRow problems={problems} />
        </div>
        <div className="standings-section list-unstyled">
          {stickyRows}
        </div>
        */ }
        <div style={{ zIndex: -1, height: `${27 * 28}px`, overflow: 'hidden' }}>
          <AnimatingList className="standings-section list-unstyled" style={{ top: `-${offsetRows * 28}px` }}>
            {normalRows}
          </AnimatingList>
        </div>
      </div>
    );
  }
}

const Clock = ({ minute }) => (
  <div style={{ width: '100%', height: '30px', position: 'relative' }}>
    <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: `${100 * minute / 180}%`, backgroundColor: '#F44336', zIndex: -1 }} />
    <div style={{ fontWeight: 'bold', fontSize: '18px', padding: '2px 0 0 6px' }}>
    { sprintf(
      '%d:%02d',
      Math.floor(minute / 60),
      Math.floor(minute) % 60) }
    </div>
  </div>
);

const StandingsTable = (props) => (
  <div>
    <div style={{ width: '100%', padding: '2px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <StandingsTableImpl minute={props.standings.minute} offsetRows={0} {...props} />
        <div style={{ height: `${27 * 28 + 4}px`, margin: '0 6px', borderLeft: '1px solid #333' }} />
        <StandingsTableImpl minute={props.standings.minute} offsetRows={27} {...props} />
      </div>
    </div>
    <Clock minute={props.standings.minute} />
  </div>
);

export default StandingsTable;
