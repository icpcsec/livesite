import React from 'react';

import { tr } from '../i18n';
import { achievementColor, TeamCol, TeamPinCol } from './StandingsTableCommon';

export const LegendRowThin = ({ problems }) => {
  return (
    <li className="team-row legend">
      <table className="team-table">
        <tbody>
          <tr>
            <th className="team-mark"></th>
            <th className="team-rank">#</th>
            <th className="team-solved">{tr('Solved', '正答数')}</th>
            <th className="team-penalty">{tr('Penalty', '時間')}</th>
            <th className="team-name">{tr('Team', 'チーム')}</th>
            <th className="team-name">{tr('University', '大学')}</th>
            <th className="team-members">{tr('Members', 'メンバー')}</th>
          </tr>
        </tbody>
      </table>
    </li>
  );
};

const TeamSolvedCol = ({ solved, numProblems }) => {
  const backgroundColor = achievementColor(solved, numProblems);
  return (
    <td className="team-solved">
      <div className="team-cell">
        <div className="team-cell-bg" style={{ backgroundColor }} />
        <div className="team-cell-fg">{solved}</div>
      </div>
    </td>
  );
};

const TeamPenaltyCol = ({ penalty }) => (
  <td className="team-penalty">
    <span style={{ fontSize: '8px' }}>({penalty})</span>
  </td>
);

export const TeamRowThin = (props) => {
  const { status, team, universityRank, numProblems, pinned, onClickPin, zIndex, className = '', ...rest } = props;
  const { rank, solved, penalty } = status;
  const { id, name, university, members } = team;
  const rewrittenClassName = 'team-row ' + className;
  const anyName = members.some((profile) => profile.name.length > 0);
  let membersText;
  if (!anyName) {
    membersText = '-';
  } else {
    membersText = '';
    members.forEach(({ name }) => {
      const displayName = name.length > 0 ? name : '?';
      if (membersText.length > 0) {
        membersText += ' / ';
      }
      membersText += displayName;
    });
  }
  const universityText = (
    <span>
      {university}
      <small>{' '}[{universityRank || '???'}]</small>
    </span>
  );
  return (
    <li className={rewrittenClassName} style={{ zIndex }} {...rest}>
      <table className="team-table">
        <tbody>
          <tr>
            <TeamPinCol pinned={pinned} onClick={onClickPin} />
            <TeamCol className="team-rank" text={rank} />
            <TeamSolvedCol solved={solved} numProblems={numProblems} />
            <TeamPenaltyCol penalty={penalty} />
            <TeamCol className="team-name" text={name} to={`/team/${id}`} />
            <TeamCol className="team-name" text={universityText} to={`/team/${id}`} />
            <TeamCol className="team-members" text={membersText} to={`/team/${id}`} />
          </tr>
        </tbody>
      </table>
    </li>
  );
};
