import React from 'react';

import TeamList from './TeamList';
import PrefectureView from './PrefectureView';
import { tr } from '../../i18n';
import siteconfig from '../../siteconfig';

const TeamIndexPage = () => (
  <div>
    <h1 className="my-4">
      {tr('Team List', 'チーム一覧')}
    </h1>
    {siteconfig.features.prefecture ? <PrefectureView /> : null}
    <TeamList />
  </div>
);

export default TeamIndexPage;
