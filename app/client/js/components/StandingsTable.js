import React from 'react';
import { Link } from 'react-router';
import shallowCompare from 'react-addons-shallow-compare';
import { sprintf } from 'sprintf-js';

import { tr } from '../i18n';
import * as siteconfig from '../siteconfig';

const DEFAULT_TEAM = {
  id: 'null',
  name: '???',
  university: '???',
  members: [],
};

const achievementColor = (solved, numProblems) => {
  // HACK: Assume 8 problems if there is no problem settings.
  const actualNumProblems = numProblems || 8;

  if (solved == 0) {
    return '#eee';
  }
  // Range is 180...-90
  const hue = 180 - (solved - 1) / (actualNumProblems - 1) * 270;
  return `hsl(${hue}, 80%, 55%)`;
};

const GenericTeamCol = ({ text, small, to, className = '', ...rest }) => {
  const rewrittenClassName = 'team-col ' + className;
  const content = <span>{text}<br /><small>{small}</small></span>;
  const inner =
      to ? <Link to={to} className="no-decoration">{content}</Link> : content;
  return <div className={rewrittenClassName} {...rest}>{inner}</div>;
};

const LegendProblemCol = ({ problem: { label, title, color = 'black' } }) => {
  return (
    <div className="team-col team-problem">
      <span title={title}>
        {label}
      </span>
      <span className="team-problem-flag">
        <span className="glyphicon glyphicon-flag" style={{ color }} />
      </span>
    </div>
  );
};

const LegendProblemCols = ({ problems }) => {
  const problemCols = problems.map((problem, i) => (
    <LegendProblemCol key={i} problem={problem} />
  ));
  return (
    <div className="team-problems">
      { problemCols }
    </div>
  );
};

const LegendRow = ({ problems }) => {
  return (
    <div className="team-row legend">
      <div className="team-col team-mark"></div>
      <div className="team-col team-rank">#</div>
      <div className="team-col team-score">{tr('Solved', '正答数')}</div>
      <div className="team-col team-name">{tr('Team/University', 'チーム/大学')}</div>
      <LegendProblemCols problems={problems} />
    </div>
  );
};

const TeamPinCol = ({ pinned, onClick, revealMode }) => {
  if (revealMode) {
    return <div />;
  }
  const className =
    'glyphicon glyphicon-pushpin' + (pinned ? ' pinned' : '');
  return (
    <div className="team-col team-mark">
      <span className={className} onClick={onClick} />
    </div>
  );
};

const TeamRevealStateCol = ({ revealMode, revealState }) => {
  if (!revealMode) {
    return <div />;
  }
  const mark = revealState === 'finalized' && <span className="glyphicon glyphicon-ok" />;
  return <div className="team-col team-mark">{mark}</div>;
};

const TeamScoreCol = ({ solved, penalty, problemSpecs }) => {
  const backgroundColor = achievementColor(solved, problemSpecs.length);
  return (
    <div className="team-col team-score">
      <div className="team-col-bg" style={{ backgroundColor }} />
      <div className="team-col-fg">
        {solved}
        <br/><small>({penalty})</small>
      </div>
    </div>
  );
};

const TeamProblemCol = ({ problem: { attempts, penalty, pendings, solved } }) => {
  let status;
  let content;
  if (solved) {
    status = 'solved';
    const hour = Math.floor(penalty / 60 / 60);
    const minute = Math.floor(penalty / 60) % 60;
    const second = Math.floor(penalty) % 60;
    const time =
      hour > 0 ?
      sprintf('%d:%02d:%02d', hour, minute, second) :
      sprintf('%d:%02d', minute, second);
    content = (
      <span>
        {time}
        <br />
        <small>
          { attempts > 0 ? <span>(+{ attempts })</span> : '-' }
        </small>
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
        -
        <br />
        <small>
          { attempts > 0 ? `(+${attempts})` : null }
        </small>
      </span>
    );
  }
  return (
    <div className="team-col team-problem">
      <div className={`team-col-bg ${status}`} />
      <div className="team-col-fg">{content}</div>
    </div>
  );
};

const TeamProblemCols = ({ problems }) => {
  const problemCols = problems.map((problem, i) => (
    <TeamProblemCol key={i} problem={problem} />
  ));
  return (
    <div className="team-problems">
      { problemCols }
    </div>
  );
};

const TeamRow = (props) => {
  const { status, team, universityRank, problems: problemSpecs, pinned, onClickPin, revealMode, zIndex, className = '', ...rest } = props;
  const { rank, solved, penalty, revealState, problems = [] } = status;
  const { id, name, university, country } = team;
  const rewrittenClassName = 'team-row ' + className;
  const universityContent = (
    <span>
      {
        siteconfig.features.country ?
        <img src={`/images/${country}.png`} style={{ width: '19px', height: '12px', marginRight: '3px', marginBottom: '1px' }} /> :
        null
      }
      {university}
      <small>{' '}[{universityRank || '???'}]</small>
    </span>
  );
  return (
    <div className={rewrittenClassName} style={{ zIndex }} {...rest}>
      <TeamRevealStateCol revealMode={revealMode} revealState={revealState} />
      <TeamPinCol revealMode={revealMode} pinned={pinned} onClick={onClickPin} />
      <GenericTeamCol className="team-rank" text={rank} />
      <TeamScoreCol solved={solved} penalty={penalty} problemSpecs={problemSpecs} />
      <GenericTeamCol className="team-name" text={name} small={universityContent} to={`/team/${id}`} />
      <TeamProblemCols problems={problems} />
    </div>
  );
};

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
    const rows = Array.from(this._dom.children);
    rows.forEach((row) => {
      row.classList.remove('animating');
      row.style.transform = undefined;
    });
    this._lastKeyToOffsetTop = new Map();
    rows.forEach((row, i) => {
      const child = this.props.children[i];
      this._lastKeyToOffsetTop.set(child.key, row.offsetTop);
    });
  }

  componentDidUpdate() {
    const rows = Array.from(this._dom.children);
    const currentKeyToOffsetTop = new Map();
    rows.forEach((row, i) => {
      const child = this.props.children[i];
      currentKeyToOffsetTop.set(child.key, row.offsetTop);
    });
    const rels = new Map();
    rows.forEach((row, i) => {
      const child = this.props.children[i];
      const currentOffsetTop = currentKeyToOffsetTop.get(child.key);
      const lastOffsetTop =
        this._lastKeyToOffsetTop.has(child.key) ?
        this._lastKeyToOffsetTop.get(child.key) :
        currentOffsetTop;
      const relativeOffsetTop = lastOffsetTop - currentOffsetTop;
      rels[child.key] = relativeOffsetTop;
      if (relativeOffsetTop != 0) {
        row.style.transform = `translate(0, ${relativeOffsetTop}px)`;
        if (row.classList.contains('reveal-row')) {
          setTimeout(() => { row.classList.add('animating'); }, 0);
          setTimeout(() => { row.style.transform = 'translate(0, 0)'; }, 0);
          setTimeout(() => { row.classList.remove('animating'); }, 500);
        } else {
          setTimeout(() => { row.classList.add('animating'); }, 0);
          setTimeout(() => { row.style.transform = 'translate(0, 0)'; }, 1000);
          setTimeout(() => { row.classList.remove('animating'); }, 1000 + 3000);
        }
      }
    });
  }

  render() {
    const { children, style, ...rest } = this.props;
    const rewrittenStyle = Object.assign({}, style, {position: 'relative'});
    return (
      <div style={rewrittenStyle} {...rest} ref={(dom) => { this._dom = dom; }}>
        {children}
      </div>
    );
  }
}

class StandingsTable extends React.Component {
  handleClickPin(teamId) {
    this.props.togglePin(teamId);
  }

  render() {
    const { standings, teamsMap, problems, pinnedTeamIds, revealMode = false } = this.props;
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
           (index == standings.length - 1 &&
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
        <div className="standings-section list-unstyled">
          <LegendRow problems={problems} />
        </div>
        <div className="standings-section list-unstyled">
          {stickyRows}
        </div>
        <AnimatingList className="standings-section list-unstyled">
          {normalRows}
        </AnimatingList>
      </div>
    );
  }
}

export default StandingsTable;
