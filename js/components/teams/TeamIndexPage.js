import React from 'react';

import TeamListContainer from './TeamListContainer';
import PrefectureViewContainer from './PrefectureViewContainer';
import { tr } from '../../i18n';
import siteconfig from '../../siteconfig';

const TeamIndexPage = () => (
  <div>
    <h1 className="my-4">
      {tr('Team List', 'チーム一覧')}
    </h1>
    {siteconfig.features.prefecture ? <PrefectureViewContainer /> : null}
    <TeamListContainer />
  </div>
);

export default TeamIndexPage;
