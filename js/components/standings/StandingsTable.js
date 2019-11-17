// Copyright 2019 LiveSite authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import deepEqual from 'deep-equal';
import React from 'react';
import { Link } from 'react-router-dom';
import deepCompare from 'react-addons-deep-compare';
import { sprintf } from 'sprintf-js';
import { connect } from 'react-redux';

import { updateSettings } from '../../actions/index';
import { tr } from '../../i18n';
import siteconfig from '../../siteconfig';
import AnimatingTable from '../common/AnimatingTable';
import AnimatingStandingsRow from '../common/AnimatingStandingsRow';

const DEFAULT_TEAM = {
  id: 'null',
  name: '???',
  university: '???',
  members: [],
};

const achievementColor = (solved, numProblems) => {
  // HACK: Assume 8 problems if there is no problem settings.
  const actualNumProblems = numProblems || 8;

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
      <div className="team-colored-col-bg" style={{ backgroundColor }} />
      <div className="team-colored-col-fg">
        {solved}
        <br/><small className="d-none d-md-inline">({penalty})</small>
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
          { attempts >= 2 ? <span>(+{ attempts - 1 })</span> : '-' }
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
      <div className={`team-colored-col-bg bg-${status}`} />
      <div className="team-colored-col-fg">{content}</div>
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
    const { solved, penalty, problemSpecs, team, universityRank, problems } = this.props;
    const { id, name, university, country } = team;
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
    const to = siteconfig.features.teamPage ? `/team/${id}` : null;
    return (
      <div className="team-right">
        <TeamScoreCol solved={solved} penalty={penalty} problemSpecs={problemSpecs} />
        <TeamGenericCol className="team-name" text={name} small={universityContent} to={to} />
        <TeamProblemCols problems={problems} />
      </div>
    );
  }
}

class TeamRow extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const FIELDS = ['entry', 'team', 'universityRank', 'problems', 'pinned', 'zIndex', 'className'];
    const cached = FIELDS.every((f) => deepEqual(this.props[f], nextProps[f]));
    return !cached;
  }

  render() {
    const { entry, team, universityRank, problems: problemSpecs, pinned, onClickPin, revealMode, zIndex, className = '', ...rest } = this.props;
    const { rank, solved, penalty, revealState, problems = [] } = entry;
    const rewrittenClassName = 'team-row ' + className;
    return (
      <div className={rewrittenClassName} style={{ zIndex }} {...rest}>
        <TeamRowLeft pinned={pinned} revealMode={revealMode} revealState={revealState} onClickPin={onClickPin} />
        <TeamGenericCol className="team-rank" text={rank} />
        <TeamRowRight solved={solved} penalty={penalty} problemSpecs={problemSpecs} team={team} universityRank={universityRank} problems={problems} />
      </div>
    );
  }
}

const RevealRow = (props) => (
  <div className="reveal-row no-animation">
    <TeamRow {...props} />
    <div className="reveal-marker" />
  </div>
);

const computeUniversityRanks = (entries, teams) => {
  const universityToEntries = {};
  entries.forEach((entry) => {
    const team = teams[entry.teamId];
    if (team) {
      const { university } = team;
      if (universityToEntries[university] === undefined) {
        universityToEntries[university] = [];
      }
      universityToEntries[university].push(entry);
    }
  });
  const universityRanks = {};
  Object.keys(universityToEntries).forEach((university) => {
    const entries = universityToEntries[university];
    entries.forEach((entry, index) => {
      if (index > 0 && entry.rank === entries[index - 1].rank) {
        universityRanks[entry.teamId] = universityRanks[entries[index - 1].teamId];
      } else {
        universityRanks[entry.teamId] = `${index + 1}/${entries.length}`;
      }
    });
  });
  return universityRanks;
};

export class StandingsTableImpl extends React.Component {
  handleClickPin(teamId) {
    this.props.togglePin(teamId);
  }

  render() {
    const { entries, teams, problems, pinnedTeamIds, revealMode = false } = this.props;
    const pinnedTeamIdSet = new Set(pinnedTeamIds);
    const universityRanks = computeUniversityRanks(entries, teams);
    const normalRows = [];
    for (let index = 0; index < entries.length; ++index) {
      const entry = entries[index];
      const team = teams[entry.teamId] || DEFAULT_TEAM;
      const revealCurrent =
          revealMode &&
          ((index + 1 < entries.length &&
            entry.revealState !== 'finalized' &&
            entries[index + 1].revealState === 'finalized') ||
           (index === entries.length - 1 &&
            entry.revealState !== 'finalized'));
      if (revealCurrent) {
        normalRows.push(
          <RevealRow
            key={'__reveal_marker__'}
            entry={entry}
            team={team}
            problems={problems}
            universityRank={universityRanks[entry.teamId]}
            pinned={false}
            revealMode={revealMode}
          />);
      }
      normalRows.push(
        <AnimatingStandingsRow
          component={TeamRow}
          key={entry.teamId}
          entry={entry}
          team={team}
          problems={problems}
          universityRank={universityRanks[entry.teamId]}
          pinned={pinnedTeamIdSet.has(entry.teamId)}
          onClickPin={() => this.handleClickPin(entry.teamId)}
          revealMode={revealMode}
          index={index}
        />
      );
    }
    const pinnedEntries = entries.filter(
      (entry) => pinnedTeamIdSet.has(entry.teamId));
    const stickyRows = pinnedEntries.map((entry) => {
      const team = teams[entry.teamId] || DEFAULT_TEAM;
      return (
        <AnimatingStandingsRow
          component={TeamRow}
          key={entry.teamId}
          entry={entry}
          team={team}
          universityRank={universityRanks[entry.teamId]}
          problems={problems}
          pinned={true}
          onClickPin={() => this.handleClickPin(entry.teamId)}
          index={0}
          className="sticky"
        />
      );
    });
    return (
      <div className="standard-standings">
        <div className="standings-section">
          <LegendRow problems={problems} />
        </div>
        <div className="standings-section">
          {stickyRows}
        </div>
        <div className="standings-section">
          <AnimatingTable>
            {normalRows}
          </AnimatingTable>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ feeds: { standings: { problems, entries }, teams }, settings: { pinnedTeamIds } }) => {
  return {
    entries,
    teams,
    problems,
    pinnedTeamIds,
  };
};

const mapDispatchToProps = (dispatch) => {
  const setPinnedTeamIds = (teamIds) => {
    dispatch(updateSettings({pinnedTeamIds: {$set: Array.from(teamIds)}}));
  };
  return { setPinnedTeamIds };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const togglePin = (teamId) => {
    const { pinnedTeamIds } = stateProps;
    const { setPinnedTeamIds } = dispatchProps;
    const pos = pinnedTeamIds.indexOf(teamId);
    if (pos < 0) {
      const newPinnedTeamIds = pinnedTeamIds.concat([teamId]);
      setPinnedTeamIds(newPinnedTeamIds);
    } else {
      const newPinnedTeamIds = pinnedTeamIds.slice();
      newPinnedTeamIds.splice(pos, 1);
      setPinnedTeamIds(newPinnedTeamIds);
    }
  };
  const extraProps = { togglePin };
  return Object.assign({}, ownProps, stateProps, dispatchProps, extraProps);
};

const StandingsTable =
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(StandingsTableImpl);

export default StandingsTable;
