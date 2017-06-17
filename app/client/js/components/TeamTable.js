import React from 'react';
import { Link } from 'react-router';

import FixedRatioThumbnail from './FixedRatioThumbnail';
import * as siteconfig from '../siteconfig';

const SmallTeamPhoto = ({ url }) => (
  <div className="team-photo">
    <FixedRatioThumbnail url={url} ratio={eval(siteconfig.photo_aspect_ratio)} />
  </div>
);

const SmallTeamMemberIcon = ({ url }) => (
  <div className="team-member-icon">
    <FixedRatioThumbnail url={url} ratio={1} />
  </div>
);

const TeamRow = ({ team: { id, name, university, photo, members } }) => {
  const icons = members.map((profile) => <SmallTeamMemberIcon url={profile.icon} />);
  return (
    <tr className="team-row">
      <td><Link to={`/team/${id}`}>{name}</Link></td>
      <td>{university}</td>
      <td>
        <SmallTeamPhoto url={photo} />
        {icons}
      </td>
    </tr>
  );
};

const TeamTable = ({ teams }) => {
  const rows = teams.map((team) => <TeamRow key={team.id} team={team} />);
  return (
    <table className="table table-striped team-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>University</th>
          <th>Members</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  );
};

export default TeamTable;
