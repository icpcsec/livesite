import React from 'react';

import ClockTextContainer from '../containers/ClockTextContainer';

const BroadcastClockPane = ({ contest }) => (
  <div style={{ position: 'absolute', right: '40px', top: '20px' }}>
    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f5f5f5', WebkitTextStroke: '1.5px black' }}>
      <ClockTextContainer />
    </div>
    <div style={{ marginTop: '-12px', width: '100%', border: '1px solid #000', backgroundColor: '#f5f5f5' }}>
      <div style={{ width: '58%', height: '8px', borderRight: '1px solid black', backgroundColor: 'orangered' }}>
      </div>
    </div>
  </div>
);

export default BroadcastClockPane;
