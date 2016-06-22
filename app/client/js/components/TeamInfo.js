import { Buffer } from 'buffer';
import React from 'react';
import { Link } from 'react-router';

import ErrorMessage from './ErrorMessage';
import FixedRatioThumbnail from './FixedRatioThumbnail';
import * as constants from '../constants';

const getRating = (ratings, key, name) => {
  const nameHex = Buffer.from(name, 'utf8').toString('hex');
  const rating = ((ratings[key] || {})[nameHex] || {}).rating;
  return ((rating && rating > 0) ? rating : 0);
};

const MemberProfile = ({ profile, ratings }) => {
  const contactsElements = [];
  if (profile.topcoderId) {
    const rating = getRating(ratings, 'topcoderId', profile.topcoderId);
    const color =
      rating >= 2200 ? '#ee0000' :
      rating >= 1500 ? '#ddcc00' :
      rating >= 1200 ? '#6666ff' :
      rating >= 900 ? '#00a900' :
      '#999999';
    contactsElements.push(
      'TopCoder: ',
      <a target="_blank"
         href={`https:\/\/www.topcoder.com/members/${profile.topcoderId}/`}
         style={{ color }}>
        {profile.topcoderId}
      </a>,
      ', ');
  }
  if (profile.codeforcesId) {
    // TODO: Support 2900+ black/red coloring
    const rating = getRating(ratings, 'codeforcesId', profile.codeforcesId);
    const color =
      rating >= 2400 ? '#ff0000' :
      rating >= 2200 ? '#ff8c00' :
      rating >= 1900 ? '#aa00aa' :
      rating >= 1600 ? '#0000ff' :
      rating >= 1400 ? '#03a89e' :
      rating >= 1200 ? '#008000' :
      '#808080';
    contactsElements.push(
      'CodeForces: ',
      <a target="_blank"
         href={`http:\/\/codeforces.com/profile/${profile.codeforcesId}/`}
         style={{ color }}>
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
        {profile.githubId}
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

const TeamInfo = ({ team, ratings }) => {
  if (!team) {
    return <ErrorMessage header="Team Not Found" />;
  }
  const memberElements = team.members.map(
    (profile) => <MemberProfile profile={profile} ratings={ratings} />);
  return (
    <div className="teaminfo">
      <div className="page-header">
        <h1>
          {team.name}
          <br />
          <small>
            {team.university}
            {' '}
            ({constants.PREFECTURES[team.prefecture || 48]})
          </small>
        </h1>
      </div>
      <FixedRatioThumbnail url={team.photo} ratio={1 / 3} />
      {memberElements}
      <div className="alert alert-success" style={{ marginBottom: '0' }}>
        チーム情報は各チーム自身によって登録・編集されたものです。
      </div>
      <div>
        <Link to={`/team/${team.id}/edit`}>
          <button className="btn btn-primary btn-raised pull-right">編集</button>
        </Link>
      </div>
    </div>
  );
};

export default TeamInfo;
