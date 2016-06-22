import React from 'react';

import TeamListContainer from '../containers/TeamListContainer';
import PrefectureViewContainer from '../containers/PrefectureViewContainer';

const TeamIndexPage = () => (
  <div>
    <h1 className="page-header">
      チーム一覧
    </h1>
    <div className="alert alert-success" style={{ marginBottom: '24px' }}>
      チーム情報は各チーム自身によって登録・編集されたものです。
    </div>
    <PrefectureViewContainer />
    <TeamListContainer />
  </div>
);

export default TeamIndexPage;
