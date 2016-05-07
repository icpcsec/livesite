import React from 'react';
import { Link } from 'react-router';

import FixedRatioThumbnail from './FixedRatioThumbnail';
import GridFlow from './GridFlow';

const TeamItem = ({ team: { id, name, university, photo, members } }) => (
  <div className="panel panel-default">
    <div className="panel-body">
      <Link to={`/team/${id}`}><FixedRatioThumbnail url={photo} ratio={1 / 3} /></Link>
      <h3 className="text-ellipsis">
        <Link to={`/team/${id}`} className="no-decoration">{name}</Link>
      </h3>
      <h4 className="text-ellipsis">
        <Link to={`/team/${id}`} className="no-decoration">{university}</Link>
      </h4>
    </div>
  </div>
);

const TeamList = ({ teams }) => {
  const filteredTeams = teams.filter((team) => !team.hidden);
  const items = filteredTeams.map((team) => <TeamItem key={team.id} team={team} />);
  return (
    <GridFlow cols={4}>
      {items}
    </GridFlow>
  );
};

export default TeamList;
