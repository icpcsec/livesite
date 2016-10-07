import React from 'react';
import { Link } from 'react-router';

import FixedRatioThumbnail from './FixedRatioThumbnail';
import GridFlow from './GridFlow';
import * as constants from '../constants';
import * as settings from '../settings';

const TeamPhoto = ({ photo, members }) => {
  if (settings.USE_ICONS_AS_PHOTO &&
      photo.startsWith('/') &&
      members.some((profile) => !profile.icon.startsWith('/'))) {
    const children = members.map(({ icon }) => (
      <div style={{ float: 'left', width: `${100 / 3}%` }}>
        <FixedRatioThumbnail url={icon} ratio={1 / 1} />
      </div>
    ));
    return <div style={{ overflow: 'hidden' }}>{children}</div>;
  }
  return <FixedRatioThumbnail url={photo} ratio={1 / 3} />
};

const TeamItem = ({ team: { id, name, university, country, photo, members } }) => (
  <div className="panel panel-default">
    <div className="panel-body">
      <Link to={`/team/${id}`}>
        <TeamPhoto photo={photo} members={members} />
      </Link>
      <h4 className="text-ellipsis">
        <Link to={`/team/${id}`} className="no-decoration">{name}</Link>
      </h4>
      <div className="text-ellipsis">
        <Link to={`/team/${id}`} className="no-decoration">
          {
            settings.ENABLE_COUNTRY ?
            <img src={`/images/${country}.png`} style={{ width: '21px', height: '14px', marginRight: '3px', marginBottom: '2px', border: '1px solid #000' }} /> :
            null
          }
          {university}
        </Link>
      </div>
    </div>
  </div>
);

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
    if (!team.hidden) {
      teamsByPrefecture[team.prefecture || 48].push(team);
    }
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
      settings.ENABLE_PREFECTURE ? TeamListWithPrefecture : TeamListSimple;

export default TeamList;
