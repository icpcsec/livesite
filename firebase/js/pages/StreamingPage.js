import React from 'react';

import StreamingScreenContainer from '../containers/StreamingScreenContainer';
import { tr } from '../i18n';
import * as siteconfig from '../siteconfig';

const StreamingPage = () => (
  <div>
    <h1 className="page-header">
      {tr('Live Streaming', '中継')}
    </h1>
    <StreamingScreenContainer />
    <div style={{ width: '800px', margin: '12px auto 0' }}>
      <p>
        Please use <a target="_blank" href={`http:\/\/ch.nicovideo.jp/${siteconfig.ui.streaming_nicolive_id}`}>the official player</a> on niconico to post comments.
      </p>
    </div>
  </div>
);

export default StreamingPage;
