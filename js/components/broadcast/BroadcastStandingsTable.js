import React from 'react';

import AnimatingList from '../common/AnimatingList';

const DEFAULT_TEAM = {
  id: 'null',
  name: '???',
  university: '???',
  members: [],
};

const TeamRow = ({ animationKey, status: { rank, solved, problems }, team: { name, universityShort }, zIndex }) => {
  const cols = problems.map(({ solved, attempts }, index) => {
    const color = solved ? '#64DD17' : attempts > 0 ? '#FF5252' : 'transparent';
    return <div key={index} style={{ width: '6px', margin: '0 1px 0 0', height: '18px', borderRadius: '2px', backgroundColor: color }} />;
  });
  return (
      <div data-key={animationKey} className="card broadcast-card" style={{zIndex}}>
        <div className="card-body">
          <div style={{display: 'flex'}}>
            <div style={{flex: '0 0 auto', margin: '0 4px', width: '20px', textAlign: 'right'}}>
              {rank}
            </div>
            <div className="text-ellipsis" style={{flex: '0 0 auto', margin: '0 4px', width: '102px'}}>
              {universityShort}
            </div>
            <div className="text-ellipsis" style={{flex: '1 1 auto', margin: '0 4px'}}>
              {name}
            </div>
            <div style={{flex: '0 0 auto', margin: '0 4px', width: '20px', textAlign: 'right'}}>
              {solved}
            </div>
            <div style={{flex: '0 0 auto'}}>
              <div style={{width: '100%', display: 'flex', marginTop: '3px' }}>
                {cols}
              </div>
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
