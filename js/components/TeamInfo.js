import React from 'react';

import ErrorMessage from './ErrorMessage';
import FixedRatioThumbnail from './FixedRatioThumbnail';
import * as constants from '../constants';
import siteconfig from '../siteconfig';

const MemberProfile = ({ profile, index }) => {
  const displayName = profile.name.length > 0 ? profile.name : `Member ${index + 1}`;
  const contactsElements = [];
  if (profile.topcoderId) {
    contactsElements.push(
      'TopCoder: ',
      <a target="_blank"
         href={`https://www.topcoder.com/members/${profile.topcoderId}/`}>
        {profile.topcoderId}
      </a>,
      ', ');
  }
  if (profile.codeforcesId) {
    contactsElements.push(
      'CodeForces: ',
      <a target="_blank"
         href={`http://codeforces.com/profile/${profile.codeforcesId}/`}>
        {profile.codeforcesId}
      </a>,
      ', ');
  }
  if (profile.atcoderId) {
    contactsElements.push(
      'AtCoder: ',
      <a target="_blank"
         href={`https://atcoder.jp/user/${profile.atcoderId}/`}>
        {profile.atcoderId}
      </a>,
      ', ');
  }
  if (profile.twitterId) {
    contactsElements.push(
      'Twitter: ',
      <a target="_blank"
         href={`https://twitter.com/${profile.twitterId}/`}>
        @{profile.twitterId}
      </a>,
      ', ');
  }
  if (profile.githubId) {
    contactsElements.push(
      'GitHub: ',
      <a target="_blank"
         href={`https://github.com/${profile.githubId}/`}>
        {profile.githubId}
      </a>,
      ', ');
  }
  if (contactsElements.length > 0) {
    contactsElements.pop();
  }
  return (
    <div className="profile card">
      <div className="card-body">
        {
          siteconfig.features.icon ?
          <div className="profile-icon">
            <FixedRatioThumbnail url={profile.icon} ratio={1} />
          </div> :
          null
        }
        <div className="profile-data" style={{ marginLeft: siteconfig.features.icon ? null : '0' }}>
          <p className="profile-name">{displayName}</p>
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
    (profile, index) =>
        <MemberProfile key={index} profile={profile} index={index} />);
  return (
    <div className="teaminfo">
      <h1 className="my-3">
        {team.name}
        <br />
        <small>
          {team.university}
          {
            siteconfig.features.prefecture ?
            ` (${constants.PREFECTURES[team.prefecture || 48]})` :
            null
          }
          {
            siteconfig.features.country ?
            ` - ${team.country}` :
            null
          }
        </small>
      </h1>
      {
        siteconfig.features.photo ?
        <FixedRatioThumbnail url={team.photo} ratio={siteconfig.ui.photo_aspect_ratio} /> :
        null
      }
      {memberElements}
    </div>
  );
};

export default TeamInfo;
