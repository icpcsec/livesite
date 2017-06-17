import React from 'react';

import TeamListContainer from '../containers/TeamListContainer';
import PrefectureViewContainer from '../containers/PrefectureViewContainer';
import { tr } from '../i18n';
import * as siteconfig from '../siteconfig';

const TeamIndexPage = () => (
  <div>
    <h1 className="page-header">
      {tr('Team List', 'チーム一覧')}
    </h1>
    {siteconfig.ENABLE_PREFECTURE ? <PrefectureViewContainer /> : null}
    <TeamListContainer />
  </div>
);

export default TeamIndexPage;
