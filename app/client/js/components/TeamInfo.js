import { Buffer } from 'buffer';
import React from 'react';
import { Link } from 'react-router';

import ErrorMessage from './ErrorMessage';
import FixedRatioThumbnail from './FixedRatioThumbnail';
import * as constants from '../constants';
import { tr } from '../i18n';
import * as siteconfig from '../siteconfig';

const getRating = (ratings, key, name) => {
  if (!ratings) {
    return 0;
  }
  const nameHex = Buffer.from(name, 'utf8').toString('hex');
  const rating = ((ratings[key] || {})[nameHex] || {}).rating;
  return ((rating && rating > 0) ? rating : 0);
};

const MemberProfile = ({ profile, ratings, index }) => {
  const displayName = profile.name.length > 0 ? profile.name : `Member ${index + 1}`;
  const contactsElements = [];
  if (profile.topcoderId) {
    const rating = getRating(ratings, 'topcoderId', profile.topcoderId);
    const color =
      rating >= 2200 ? '#ee0000' :
      rating >= 1500 ? '#ddcc00' :
      rating >= 1200 ? '#6666ff' :
      rating >= 900 ? '#00a900' :
      rating > 0 ? '#999999' :
      null;
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
      rating > 0 ? '#808080' :
      null;
    contactsElements.push(
      'CodeForces: ',
      <a target="_blank"
         href={`http:\/\/codeforces.com/profile/${profile.codeforcesId}/`}
         style={{ color }}>
        {profile.codeforcesId}
      </a>,
      ', ');
  }
  if (profile.atcoderId) {
    const rating = getRating(ratings, 'atcoderId', profile.atcoderId);
    // TODO(nya): Implement
    const color = null;
    contactsElements.push(
      'AtCoder: ',
      <a target="_blank"
         href={`https:\/\/atcoder.jp/user/${profile.atcoderId}/`}
         style={{ color }}>
        {profile.atcoderId}
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

const TeamInfo = ({ team, ratings }) => {
  if (!team) {
    return <ErrorMessage header="Team Not Found" />;
  }
  const memberElements = team.members.map(
    (profile, index) => <MemberProfile profile={profile} ratings={ratings} index={index} />);
  return (
    <div className="teaminfo">
      <div className="page-header">
        <h1>
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
      </div>
      {
        siteconfig.features.photo ?
        <FixedRatioThumbnail url={team.photo} ratio={eval(siteconfig.ui.photo_aspect_ratio)} /> :
        null
      }
      {memberElements}
      <div>
        <Link to={`/team/${team.id}/edit`}>
          <button className="btn btn-primary btn-raised pull-right">
            {tr('Edit', '編集')}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default TeamInfo;
