import React from 'react';

import AnimatingList from '../common/AnimatingList';

const DEFAULT_TEAM = {
  id: 'null',
  name: '???',
  university: '???',
  members: [],
};

const TeamRow = ({ animationKey, status: { rank, solved, problems }, team: { name, universityShort }, zIndex }) => {
  const cols = problems.map(({ solved, attempts, pendings }, index) => {
    const status = solved ? 'solved' : pendings > 0 ? 'pending' : attempts > 0 ? 'rejected' : 'unattempted';
    return <div key={index} className={`team-problem bg-${status}`} />
  });
  return (
      <div data-key={animationKey} className="card broadcast-card" style={{zIndex}}>
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
            <div className="team-solved">
              {solved}
            </div>
            <div className="team-problems">
              {cols}
            </div>
          </div>
        </div>
      </div>
  );
};

class BroadcastStandingsTable extends React.Component {
  render() {
    const { standings, teams, numRows = 20, offsetRows = 0 } = this.props;
    const rows = [];
    for (let index = 0; index < standings.length; ++index) {
      const status = standings[index];
      const team = teams[status.teamId] || DEFAULT_TEAM;
      rows.push(
          <TeamRow
              key={status.teamId}
              animationKey={status.teamId}
              status={status}
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
          <AnimatingList>
            {rows}
          </AnimatingList>
        </div>
      </div>
    );
  }
}

export default BroadcastStandingsTable;
