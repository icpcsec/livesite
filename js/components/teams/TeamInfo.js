// Copyright 2019 LiveSite authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { connect } from 'react-redux';

import ErrorMessage from '../common/ErrorMessage';
import FixedRatioThumbnail from '../common/FixedRatioThumbnail';
import * as constants from '../../constants';
import siteconfig from '../../siteconfig';

const TeamComment = ({ comment }) => (
  <div className="alert alert-secondary mt-3 mb-2" style={{ textAlign: 'center' }}>
    {comment}
  </div>
);

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
      <br />);
  }
  if (profile.codeforcesId) {
    contactsElements.push(
      'CodeForces: ',
      <a target="_blank"
         href={`http://codeforces.com/profile/${profile.codeforcesId}/`}>
        {profile.codeforcesId}
      </a>,
      <br />);
  }
  if (profile.atcoderId) {
    contactsElements.push(
      'AtCoder: ',
      <a target="_blank"
         href={`https://atcoder.jp/user/${profile.atcoderId}/`}>
        {profile.atcoderId}
      </a>,
      <br />);
  }
  if (profile.twitterId) {
    contactsElements.push(
      'Twitter: ',
      <a target="_blank"
         href={`https://twitter.com/${profile.twitterId}/`}>
        @{profile.twitterId}
      </a>,
      <br />);
  }
  if (profile.githubId) {
    contactsElements.push(
      'GitHub: ',
      <a target="_blank"
         href={`https://github.com/${profile.githubId}/`}>
        {profile.githubId}
      </a>,
      <br />);
  }
  if (contactsElements.length > 0) {
    contactsElements.pop();
  }
  return (
    <div className="col-lg-4">
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
    </div>
  );
};

const TeamInfoImpl = ({ team }) => {
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
        <FixedRatioThumbnail url={team.photo} ratio={siteconfig.ui.photoAspectRatio} /> :
        null
      }
      {
        team.comment ? <TeamComment comment={team.comment} /> : null
      }
      <div className="row">
        {memberElements}
      </div>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { feeds: { teams } } = state;
  const team = teams[ownProps.requestedTeamId];
  return { team };
};

const TeamInfo = connect(mapStateToProps)(TeamInfoImpl);

export default TeamInfo;
