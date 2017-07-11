import React from 'react';

import { tr } from '../i18n';
import { achievementColor, TeamCol, TeamPinCol } from './StandingsTableCommon';

const LegendProblemCol = ({ problem: { label, title, color = 'black' } }) => {
  return (
    <th className="team-problem">
      <span title={title}>
        {label}
      </span>
      <span className="team-problem-flag" style={{ display: 'none' }}>
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

const TeamSolvedCol = ({ solved, problemSpecs }) => {
  const backgroundColor = achievementColor(solved, problemSpecs.length);
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

const TeamProblemCol = ({ problem: { solved }, problemSpec: { color } }) => {
  let content;
  if (solved) {
    content = <span className="glyphicon glyphicon-flag" style={{ color }} />;
  } else {
    content = '-';
  }
  return (
    <td className="team-problem">
      <div className="team-cell">
        { content }
      </div>
    </td>
  );
};

export const TeamRowMedium = (props) => {
  const { status, team, universityRank, problems: problemSpecs, pinned, onClickPin, zIndex, className = '', ...rest } = props;
  const { rank, solved, penalty, problems = [] } = status;
  const { id, name, university } = team;
  const rewrittenClassName = 'team-row ' + className;
  const problemCols = [];
  if (problems.length > 0) {
    problems.forEach((problem, i) => {
      problemCols.push(<TeamProblemCol key={i} problem={problem} problemSpec={problemSpecs[i]} />);
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
            <TeamSolvedCol solved={solved} problemSpecs={problemSpecs} />
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
