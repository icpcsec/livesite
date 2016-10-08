import React from 'react';

import TeamListContainer from '../containers/TeamListContainer';
import PrefectureViewContainer from '../containers/PrefectureViewContainer';
import * as siteconfig from '../siteconfig';

const TeamIndexPage = () => (
  <div>
    <h1 className="page-header">
      {siteconfig.JA ? 'チーム一覧' : 'Team List'}
    </h1>
    {siteconfig.ENABLE_PREFECTURE ? <PrefectureViewContainer /> : null}
    <TeamListContainer />
  </div>
);

export default TeamIndexPage;
