import React from 'react';

const MockProfilePanel = () => (
  <div className="profile panel panel-default">
    <div className="panel-body">
      <img className="profile-icon" src="https://pbs.twimg.com/profile_images/624835411857182720/ofucivPz.jpg" />
      <div className="profile-data">
        <p className="profile-name">Shuhei Takahashi</p>
        <p className="profile-contacts">Twitter: @nya3jp, TopCoder: nya</p>
        <p className="profile-message">今日も一日がんばるぞい！</p>
      </div>
    </div>
  </div>
);

const TeamInfo = ({ team: { name, university } }) => (
  <div className="teaminfo">
    <div className="page-header">
      <h1>
        {name}
        <br />
        <small>{university}</small>
      </h1>
    </div>
    <div className="row">
      <div className="col-xs-6">
        <img className="team-photo" src="https://pbs.twimg.com/media/CanV-yKUEAACEcN.jpg:medium" />
      </div>
      <div className="col-xs-6">
        <MockProfilePanel />
        <MockProfilePanel />
        <MockProfilePanel />
      </div>
    </div>
  </div>
);

export default TeamInfo;
