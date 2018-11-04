import React from 'react';

import StandingsTable from './StandingsTable';

const StandingsPane = () => (
    <div style={{ position: 'absolute', right: '20px', top: '120px', width: '380px' }}>
      <StandingsTable />
    </div>
);

export default StandingsPane;
