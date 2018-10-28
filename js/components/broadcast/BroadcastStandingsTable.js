import React from 'react';

import AnimatingList from '../common/AnimatingList';
import TimerSet from '../../utils/TimerSet';

const DEFAULT_TEAM = {
  id: 'null',
  name: '???',
  university: '???',
  members: [],
};

const TeamRow = ({ status: { rank, solved, problems }, team: { name, universityShort }, zIndex }) => {
  const cols = problems.map(({ solved, attempts }) => {
    const color = solved ? '#64DD17' : attempts > 0 ? '#FF5252' : 'transparent';
    return <div style={{ width: '6px', margin: '0 1px 0 0', height: '18px', borderRadius: '2px', backgroundColor: color }} />;
  });
  return (
      <div className="card" style={{zIndex, marginBottom: '1px', fontSize: 'inherit', backgroundColor: 'rgba(245, 245, 245, 0.9)'}}>
        <div className="card-body" style={{padding: '2px'}}>
          <div style={{display: 'flex'}}>
            <div style={{flex: '0 0 auto', margin: '0 4px', width: '20px', textAlign: 'right'}}>
              {rank}
            </div>
            <div style={{flex: '0 0 auto', margin: '0 4px', width: '102px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
              {universityShort}
            </div>
            <div style={{flex: '1 1 auto', margin: '0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
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
