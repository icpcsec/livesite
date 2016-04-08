import React from 'react';

import { Link } from 'react-router';

const TeamRow = ({ team: { id, name, university } }) => (
  <tr>
    <td><Link to={`/team/${id}`}>{name}</Link></td>
    <td>{university}</td>
  </tr>
);

const TeamTable = ({ teams }) => {
  const sortedTeams = [...teams];
  sortedTeams.sort((a, b) => (a.id - b.id));
  const rows = sortedTeams.map((team) => <TeamRow key={team.id} team={team} />);
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>Name</th>
          <th>University</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  );
};

export default TeamTable;
