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

const Count = ({ count, color }) => {
  if (count === 0) {
    return '0';
  }
  return <span style={{ color, fontWeight: 'bold' }}>{count}</span>;
};

const TeamRow = ({ entry: { rank, solved, problems }, team: { name, universityShort }, zIndex, className, ...rest }) => {
  let numSolved = 0, numRejected = 0, numPending = 0;
  for (const problem of problems) {
    if (problem.solved) {
      ++numSolved;
    } else if (problem.pendings > 0) {
      ++numPending;
    } else if (problem.attempts > 0) {
      ++numRejected;
    }
  }
  const rewrittenClassName = `${className} card broadcast-card`;
  return (
      <div className={rewrittenClassName} style={{zIndex}} {...rest}>
        <div className="card-body">
          <div className="team-row">
            <div className="team-rank">
              {rank}
            </div>
            <div className="team-univ text-ellipsis">
              {universityShort}
            </div>
            <div className="team-name text-ellipsis">
              {name}
            </div>
            <div className="team-stats">
              <Count count={numSolved} color="#0c0" />
              /
              <Count count={numRejected} color="red" />
              /
              <Count count={numPending} color="yellow" />
            </div>
          </div>
        </div>
      </div>
  );
};

class BroadcastStandingsTableImpl extends React.Component {
  render() {
    const { entries, teams, numRows = 20, offsetRows = 0 } = this.props;
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
              zIndex={9999 - index}
          />
      );
    }
    const rowHeight = 28 + 1;
    const tableHeight = rowHeight * numRows;
    const tableOffset = -rowHeight * offsetRows;
    return (
      <div className="broadcast-standings" style={{ overflow: 'hidden', height: `${tableHeight}px` }}>
        <div style={{ position: 'relative', top: `${tableOffset}px` }}>
          <AnimatingTable>
            {rows}
          </AnimatingTable>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ standings: { entries }, teams }) => ({ entries, teams });

const BroadcastStandingsTable =
    connect(mapStateToProps)(BroadcastStandingsTableImpl);

export default BroadcastStandingsTable;
