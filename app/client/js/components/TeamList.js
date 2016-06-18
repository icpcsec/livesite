import React from 'react';
import { Link } from 'react-router';

import FixedRatioThumbnail from './FixedRatioThumbnail';
import GridFlow from './GridFlow';
import * as constants from '../constants';

const TeamItem = ({ team: { id, name, university, photo, members } }) => (
  <div className="panel panel-default">
    <div className="panel-body">
      <Link to={`/team/${id}`}><FixedRatioThumbnail url={photo} ratio={1 / 3} /></Link>
      <h4 className="text-ellipsis">
        <Link to={`/team/${id}`} className="no-decoration">{name}</Link>
      </h4>
      <div className="text-ellipsis">
        <Link to={`/team/${id}`} className="no-decoration">{university}</Link>
      </div>
    </div>
  </div>
);

const TeamList = ({ teams }) => {
  const teamsByPrefecture = {};
  for (let i = 1; i <= 48; ++i) {
    teamsByPrefecture[i] = [];
  }
  teams.forEach((team) => {
    if (!teams.hidden) {
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

export default TeamList;
