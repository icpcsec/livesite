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

import React from 'react';
import { connect } from 'react-redux';

import AnimatingTable from '../common/AnimatingTable';
import { createAnimatingStandingsRow } from '../common/AnimatingStandingsRow';
import { sprintf } from 'sprintf-js';

const DEFAULT_TEAM = {
  id: 'null',
  name: '???',
  university: '???',
  members: [],
};

function LegendProblemCol({ problem: { label, title, color = 'black' } }) {
  return (
    <div className="team-problem">
      <div>
        <span title={title}>{label}</span>
        <span className="team-problem-flag">
          <i className="fas fa-flag" style={{ color }} />
        </span>
      </div>
    </div>
  );
}

function LegendRow({ problems }) {
  const problemCols = problems.map((problem, i) => (
    <LegendProblemCol key={i} problem={problem} />
  ));
  return (
    <div className="card">
      <div className="card-body">
        <div className="team-row">
          <div className="team-rank" />
          <div className="team-solved" />
          <div className="team-name-univ text-ellipsis" />
          <div className="team-problems">{problemCols}</div>
        </div>
      </div>
    </div>
  );
}

function TeamProblemCol({ problem: { attempts, penalty, pendings, solved } }) {
  let status;
  let content;
  if (solved) {
    status = 'solved';
    const hour = Math.floor(penalty / 60 / 60);
    const minute = Math.floor(penalty / 60) % 60;
    const second = Math.floor(penalty) % 60;
    const time =
      hour > 0
        ? sprintf('%d:%02d:%02d', hour, minute, second)
        : sprintf('%d:%02d', minute, second);
    content = (
      <span>
        {time}
        <br />
        <small>{attempts >= 2 ? <span>(+{attempts - 1})</span> : '-'}</small>
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
        <small>{attempts > 0 ? `(+${attempts})` : null}</small>
      </span>
    );
  }
  return (
    <div className="team-problem">
      <div className={`team-colored-col-bg bg-${status}`} />
      <div className="team-colored-col-fg">{content}</div>
    </div>
  );
}

const TeamRow = createAnimatingStandingsRow(function TeamRow({
  entry: { rank, solved, penalty, problems },
  team: { name, university, universityJa },
  zIndex,
  className,
  ...rest
}) {
  const problemCols = problems.map((problem, i) => (
    <TeamProblemCol key={i} problem={problem} />
  ));
  const rewrittenClassName = `${className} card`;
  return (
    <div className={rewrittenClassName} style={{ zIndex }} {...rest}>
      <div className="card-body">
        <div className="team-row">
          <div className="team-rank">{rank}</div>
          <div className="team-solved">
            {solved}
            <br />
            <small>({penalty})</small>
          </div>
          <div className="team-name-univ text-ellipsis">
            {name}
            <br />
            <small>{universityJa || university}</small>
          </div>
          <div className="team-problems">{problemCols}</div>
        </div>
      </div>
    </div>
  );
});

class DetailedStandingsTableImpl extends React.Component {
  render() {
    const {
      problems,
      entries,
      teams,
      numRows = 12,
      offsetRows = 0,
    } = this.props;
    const rows = [];
    for (let index = 0; index < entries.length; ++index) {
      const entry = entries[index];
      const team = teams[entry.teamId] || DEFAULT_TEAM;
      rows.push(
        <TeamRow
          key={entry.teamId}
          entry={entry}
          team={team}
          index={index}
        />
      );
    }
    const rowHeight = 46 + 1;
    const tableHeight = rowHeight * numRows;
    const tableOffset = -rowHeight * offsetRows;
    return (
      <div className="broadcast-detailed-standings">
        <LegendRow problems={problems} />
        <div style={{ overflow: 'hidden', height: `${tableHeight}px` }}>
          <div style={{ position: 'relative', top: `${tableOffset}px` }}>
            <AnimatingTable>{rows}</AnimatingTable>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps({
  feeds: {
    standings: { problems, entries },
    teams,
  },
}) {
  return { problems, entries, teams };
}

const DetailedStandingsTable = connect(mapStateToProps)(
  DetailedStandingsTableImpl
);

export default DetailedStandingsTable;
