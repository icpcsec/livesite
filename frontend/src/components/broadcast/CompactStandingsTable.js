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
import {connect} from 'react-redux';

import AnimatingTable from '../common/AnimatingTable';
import AnimatingStandingsRow from '../common/AnimatingStandingsRow';

const DEFAULT_TEAM = {
  id: 'null',
  name: '???',
  university: '???',
  members: [],
};

function TeamInfo({ rank, name, university, universityJa, universityJaShort, solved, penalty }) {
  return (
    <div className="team-info">
      <div className="team-rank">
        {rank}
      </div>
      <div className="team-univ text-ellipsis">
        {universityJaShort || universityJa || university}
      </div>
      <div className="team-name text-ellipsis">
        {name}
      </div>
      <div className="team-solved">
        <small>{penalty}/</small>{solved}
      </div>
    </div>
  );
}

function TeamProblemCol({ solved, attempts, pendings }) {
  const status = solved ? 'solved' : pendings > 0 ? 'pending' : attempts > 0 ? 'rejected' : 'unattemped';
  return <div className={`team-problem bg-${status}`} />;
}

function TeamProblems({ problems }) {
  const problemCols = problems.map((problem, i) => <TeamProblemCol key={i} {...problem} />);
  return (
      <div className="team-problems">
        {problemCols}
      </div>
  )
}

function TeamRow({ entry: { rank, problems, solved, penalty }, team, zIndex, className, ...rest }) {
  const rewrittenClassName = `${className} card`;
  return (
      <div className={rewrittenClassName} style={{zIndex}} {...rest}>
        <div className="card-body">
          <div className="team-row">
            <TeamInfo rank={rank} solved={solved} penalty={penalty} {...team} />
            <TeamProblems problems={problems} />
          </div>
        </div>
      </div>
  );
}

class CompactStandingsTableImpl extends React.Component {
  render() {
    const { entries, teams, numRows = 20, offsetRows = 0, dense = false } = this.props;
    const rows = [];
    for (let index = 0; index < entries.length; ++index) {
      const entry = entries[index];
      const team = teams[entry.teamId] || DEFAULT_TEAM;
      rows.push(
          <AnimatingStandingsRow
              key={entry.teamId}
              component={TeamRow}
              entry={entry}
              team={team}
              index={index}
          />
      );
    }
    const rowHeight = (dense ? 33 : 36) + 1;
    const tableHeight = rowHeight * numRows;
    const tableOffset = -rowHeight * offsetRows;
    return (
        <div className={`broadcast-compact-standings ${dense ? 'dense' : ''}`}>
          <div style={{ overflow: 'hidden', height: `${tableHeight}px` }}>
            <div style={{ position: 'relative', top: `${tableOffset}px` }}>
              <AnimatingTable>
                {rows}
              </AnimatingTable>
            </div>
          </div>
        </div>
    );
  }
}

function mapStateToProps({ feeds: { standings: { entries }, teams } }) {
  return { entries, teams };
}

const CompactStandingsTable =
    connect(mapStateToProps)(CompactStandingsTableImpl);

export default CompactStandingsTable;
