import React from 'react';
import { sprintf } from 'sprintf-js';

import { tr } from '../i18n';
import * as siteconfig from '../siteconfig';
import { achievementColor, TeamCol, TeamPinCol, RevealMarker } from './StandingsTableCommon';

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

export const LegendRowV1 = ({ problems }) => {
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
            <th className="team-score">{tr('Solved', '正答数')}</th>
            <th className="team-name">{tr('Team/University', 'チーム/大学')}</th>
            {problemCols}
          </tr>
        </tbody>
      </table>
    </li>
  );
};

const TeamRevealStateCol = ({ revealState }) => (
  <td className="team-mark">
    <span className="glyphicon glyphicon-ok"
          style={{ display: (revealState === 'finalized' ? null : 'none') }} />
  </td>
);

const TeamScoreCol = ({ solved, penalty, problemSpecs }) => {
  const backgroundColor = achievementColor(solved, problemSpecs.length);
  return (
    <td className="team-score">
      <div className="team-cell">
        <div className="team-cell-bg" style={{ backgroundColor }} />
        <div className="team-cell-fg">
          {solved}
          <br/><small>({penalty})</small>
        </div>
      </div>
    </td>
  );
};

const TeamProblemCol = ({ problem: { attempts, penalty, pendings, solved } }) => {
  let status;
  let content;
  if (solved) {
    status = 'solved';
    const hour = Math.floor(penalty / 60 / 60);
    const minute = Math.floor(penalty / 60) % 60;
    const second = Math.floor(penalty) % 60;
    const time =
      hour > 0 ?
      sprintf('%d:%02d:%02d', hour, minute, second) :
      sprintf('%d:%02d', minute, second);
    content = (
      <span>
        {time}
        <br />
        <small>
          { attempts > 0 ? <span>(+{ attempts })</span> : '-' }
        </small>
      </span>
    );
  } else {
    if (pendings > 0) {
      status = 'pending';
    } else if (attempts > 0) {
      status = 'rejected';
    } else {
      status = 'unattempted';
    }
    content = (
      <span>
        -
        <br />
        <small>
          { attempts > 0 ? `(+${attempts})` : null }
        </small>
      </span>
    );
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

export const TeamRowV1 = (props) => {
  const { status, team, universityRank, problems: problemSpecs, pinned, onClickPin, revealState, firstRevealFinalized, zIndex, className = '', ...rest } = props;
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
  const universityContent = (
    <span>
      {
        siteconfig.features.country ?
        <img src={`/images/${country}.png`} style={{ width: '19px', height: '12px', marginRight: '3px', marginBottom: '1px' }} /> :
        null
      }
      {university}
      <small>{' '}[{universityRank || '???'}]</small>
    </span>
  );
  const markCol = revealState ?
    <TeamRevealStateCol revealState={revealState} /> :
    <TeamPinCol pinned={pinned} onClick={onClickPin} />;
  const revealMarker = firstRevealFinalized && <RevealMarker />;
  return (
    <li className={rewrittenClassName} style={{ zIndex }} {...rest}>
      {revealMarker}
      <table className="team-table">
        <tbody>
          <tr>
            {markCol}
            <TeamCol className="team-rank" text={rank} />
            <TeamScoreCol className="team-score" solved={solved} penalty={penalty} problemSpecs={problemSpecs} />
            <TeamCol className="team-name" text={name} small={universityContent} to={`/team/${id}`} />
            {problemCols}
          </tr>
        </tbody>
      </table>
    </li>
  );
};
