import React from 'react';

import TeamListContainer from '../containers/TeamListContainer';
import PrefectureViewContainer from '../containers/PrefectureViewContainer';

const TeamIndexPage = () => (
  <div>
    <h1 className="page-header">
      チーム一覧
    </h1>
    <PrefectureViewContainer />
    <TeamListContainer />
  </div>
);

export default TeamIndexPage;
