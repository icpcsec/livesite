import React from 'react';

import StandingsTable from './StandingsTable';

const Page = ({page}) => (
    <div style={{ width: '380px', flex: '0 0 auto' }}>
      <StandingsTable numRows={20} offsetRows={20 * page} />
    </div>
);

const FullStandingsPane = () => (
    <div style={{ position: 'absolute', top: '120px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-around' }}>
      <Page page={0} />
      <Page page={1} />
      <Page page={2} />
    </div>
);

export default FullStandingsPane;
