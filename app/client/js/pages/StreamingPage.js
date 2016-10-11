import React from 'react';

import StreamingScreenContainer from '../containers/StreamingScreenContainer';
import * as siteconfig from '../siteconfig';

const StreamingPage = () => (
  <div>
    <h1 className="page-header">
      {siteconfig.JA ? '中継' : 'Live Streaming'}
    </h1>
    <StreamingScreenContainer />
  </div>
);

export default StreamingPage;
