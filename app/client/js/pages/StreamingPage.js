import React from 'react';

import StreamingScreenContainer from '../containers/StreamingScreenContainer';
import * as siteconfig from '../siteconfig';

const StreamingPage = () => (
  <div>
    <h1 className="page-header">
      {siteconfig.JA ? '中継' : 'Live Streaming'}
    </h1>
    <StreamingScreenContainer />
    <div style={{ width: '800px', margin: '12px auto 0' }}>
      <p>
        Please use <a target="_blank" href={`http:\/\/ch.nicovideo.jp/${siteconfig.STREAMING_NICOLIVE_ID}`}>the official player</a> on niconico to post comments.
      </p>
    </div>
  </div>
);

export default StreamingPage;
