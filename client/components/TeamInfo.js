import React from 'react';
import { Link } from 'react-router';

import ErrorMessage from './ErrorMessage';
import FixedRatioThumbnail from './FixedRatioThumbnail';

const MemberProfile = ({ profile }) => {
  const contactsElements = [];
  if (profile.topcoderId) {
    // TODO: Color!
    contactsElements.push(
      'TopCoder: ',
      <a target="_blank"
         href={`https:\/\/www.topcoder.com/members/${profile.topcoderId}/`}>
        {profile.topcoderId}
      </a>,
      ', ');
  }
  if (profile.codeforcesId) {
    // TODO: Color!
    contactsElements.push(
      'CodeForces: ',
      <a target="_blank"
         href={`http:\/\/codeforces.com/profile/${profile.codeforcesId}/`}>
        {profile.codeforcesId}
      </a>,
      ', ');
  }
  if (profile.twitterId) {
    contactsElements.push(
      'Twitter: ',
      <a target="_blank"
         href={`https:\/\/twitter.com/${profile.twitterId}/`}>
        @{profile.twitterId}
      </a>,
      ', ');
  }
  if (profile.githubId) {
    contactsElements.push(
      'GitHub: ',
      <a target="_blank"
         href={`https:\/\/github.com/${profile.githubId}/`}>
        @{profile.githubId}
      </a>,
      ', ');
  }
  if (contactsElements.length > 0) {
    contactsElements.pop();
  }
  return (
    <div className="profile panel panel-default">
      <div className="panel-body">
        <div className="profile-icon">
          <FixedRatioThumbnail url={profile.icon} ratio={1} />
        </div>
        <div className="profile-data">
          <p className="profile-name">{profile.name}</p>
          <p className="profile-contacts">{contactsElements}</p>
          <p className="profile-comment">{profile.comment}</p>
        </div>
      </div>
    </div>
  );
};

const TeamInfo = ({ team }) => {
  if (!team) {
    return <ErrorMessage header="Team Not Found" />;
  }
  const memberElements = team.members.map(
    (profile) => <MemberProfile profile={profile} />);
  return (
    <div className="teaminfo">
      <div className="page-header">
        <h1>
          {team.name}
          <br />
          <small>{team.university}</small>
        </h1>
      </div>
      <FixedRatioThumbnail url={team.photo} ratio={1 / 3} />
      {memberElements}
      <div>
        <Link to={`/team/${team.id}/edit`}>
          <button className="btn btn-primary btn-raised pull-right">編集</button>
        </Link>
      </div>
    </div>
  );
};

export default TeamInfo;
