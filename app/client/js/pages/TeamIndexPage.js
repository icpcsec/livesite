import React from 'react';

import TeamListContainer from '../containers/TeamListContainer';
import PrefectureViewContainer from '../containers/PrefectureViewContainer';
import * as settings from '../settings';

const TeamIndexPage = () => (
  <div>
    <h1 className="page-header">
      {settings.JA ? 'チーム一覧' : 'Team List'}
    </h1>
    {settings.ENABLE_PREFECTURE ? <PrefectureViewContainer /> : null}
    <TeamListContainer />
  </div>
);

export default TeamIndexPage;
