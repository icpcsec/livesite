import React from 'react';
import { Link } from 'react-router';

import FixedRatioThumbnail from './FixedRatioThumbnail';
import GridFlow from './GridFlow';
import * as constants from '../constants';
import * as siteconfig from '../siteconfig';

const TeamPhoto = ({ photo, members }) => {
  if (siteconfig.features.use_icons_as_photo &&
      photo.startsWith('/') &&
      members.some((profile) => !profile.icon.startsWith('/'))) {
    const children = members.map(({ icon }) => (
      <div style={{ float: 'left', width: `${100 / 3}%` }}>
        <FixedRatioThumbnail url={icon} ratio={1 / 1} />
      </div>
    ));
    return <div style={{ overflow: 'hidden' }}>{children}</div>;
  }
  return <FixedRatioThumbnail url={photo} ratio={eval(siteconfig.photo_aspect_ratio)} />
};

const TeamItem = ({ team: { id, name, university, country, photo, members } }) => {
  const displayNames = [];
  for (let profile of members) {
    const { name } = profile;
    const displayName = name.length > 0 ? name : '?';
    displayNames.push(displayName);
  }
  const hasInfo = members.some((profile) => profile.name.length > 0);
  const memberNames = displayNames.join(' / ');
  return (
    <div className="panel panel-default" style={{ backgroundColor: (hasInfo ? null : 'inherit !important') }}>
      <div className="panel-body">
        {
          siteconfig.features.photo ?
          <Link to={`/team/${id}`}>
            <TeamPhoto photo={photo} members={members} />
          </Link> :
          null
        }
        <h4 className="text-ellipsis">
          <Link to={`/team/${id}`} className="no-decoration">{name}</Link>
        </h4>
        <div className="text-ellipsis">
          <Link to={`/team/${id}`} className="no-decoration">
            {
              siteconfig.features.country ?
              <img src={`/images/${country}.png`} style={{ width: '21px', height: '14px', marginRight: '3px', marginBottom: '2px', border: '1px solid #000' }} /> :
              null
            }
            {university}
          </Link>
        </div>
        <div className="text-ellipsis" style={{ paddingTop: '6px' }}>
          <Link to={`/team/${id}`} className="no-decoration">
            {memberNames}
          </Link>
        </div>
      </div>
    </div>
  );
};

const TeamListSimple = ({ teams }) => {
  const sortedTeams = [...teams];
  sortedTeams.sort((a, b) => (
      a.university.localeCompare(b.university) ||
      a.name.localeCompare(b.name) ||
      a.id.localeCompare(b.id)));
  const items = sortedTeams.map(
      (team) => <TeamItem key={team.id} team={team} />);
  return <GridFlow cols={4}>{items}</GridFlow>;
};

const TeamListWithPrefecture = ({ teams }) => {
  const teamsByPrefecture = {};
  for (let i = 1; i <= 48; ++i) {
    teamsByPrefecture[i] = [];
  }
  teams.forEach((team) => {
    teamsByPrefecture[team.prefecture || 48].push(team);
  });
  const children = [];
  for (let i = 1; i <= 48; ++i) {
    const teamsInPrefecture = teamsByPrefecture[i];
    teamsInPrefecture.sort((a, b) => (
      a.university.localeCompare(b.university) ||
      a.name.localeCompare(b.name) ||
      a.id.localeCompare(b.id)));
    const count = teamsInPrefecture.length;
    if (count > 0) {
      const items = teamsInPrefecture.map(
        (team) => <TeamItem key={team.id} team={team} />);
      const name = constants.PREFECTURES[i];
      children.push(<h3 id={`pref${i}`}>{`${name} (${count})`}</h3>);
      children.push(<GridFlow cols={4}>{items}</GridFlow>);
    }
  }
  return <div>{children}</div>;
};

const TeamList =
  siteconfig.features.prefecture ? TeamListWithPrefecture : TeamListSimple;

export default TeamList;
