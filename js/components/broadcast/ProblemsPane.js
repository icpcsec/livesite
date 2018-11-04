import React from 'react';

import ProblemsTable from './ProblemsTable';

const ProblemsPane = () => (
    <div style={{ position: 'absolute', right: '20px', top: '120px', width: '160px' }}>
      <ProblemsTable />
    </div>
);

export default ProblemsPane;
