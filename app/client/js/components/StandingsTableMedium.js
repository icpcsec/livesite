import React from 'react';
import { sprintf } from 'sprintf-js';

import { tr } from '../i18n';
import * as siteconfig from '../siteconfig';
import { achievementColor, TeamCol, TeamPinCol } from './StandingsTableCommon';

const LegendProblemCol = ({ problem: { label, title, color = 'black' } }) => {
  return (
    <th className="team-problem">
      <span title={title}>
        {label}
      </span>
      <span className="team-problem-flag">
        <span className="glyphicon glyphicon-flag" style={{ color }} />
      </span>
    </th>
  );
};

export const LegendRowMedium = ({ problems }) => {
  const problemCols = [];
  if (problems.length > 0) {
    problems.forEach((problem, i) => {
      problemCols.push(<LegendProblemCol key={i} problem={problem} />);
    });
  } else {
    problemCols.push(<th />);
  }
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
            {problemCols}
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

const TeamProblemCol = ({ problem: { solved } }) => {
  let status;
  let content;
  if (solved) {
    status = 'solved';
    content = <span className="glyphicon glyphicon-ok" />;
  } else {
    status = 'unattempted';
    content = '-';
  }
  return (
    <td className="team-problem">
      <div className="team-cell">
        <div className={`team-cell-bg ${status}`} />
        <div className="team-cell-fg">{content}</div>
      </div>
    </td>
  );
};

export const TeamRowMedium = (props) => {
  const { status, team, universityRank, numProblems, pinned, onClickPin, zIndex, className = '', ...rest } = props;
  const { rank, solved, penalty, problems = [] } = status;
  const { id, name, university, country } = team;
  const rewrittenClassName = 'team-row ' + className;
  const problemCols = [];
  if (problems.length > 0) {
    problems.forEach((problem, i) => {
      problemCols.push(<TeamProblemCol key={i} problem={problem} />);
    });
  } else {
    problemCols.push(<td />);
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
            {problemCols}
          </tr>
        </tbody>
      </table>
    </li>
  );
};
