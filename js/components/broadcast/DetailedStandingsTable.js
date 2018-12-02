import React from 'react';
import {connect} from 'react-redux';

import AnimatingTable from '../common/AnimatingTable';
import AnimatingStandingsRow from '../common/AnimatingStandingsRow';
import {sprintf} from 'sprintf-js';

const DEFAULT_TEAM = {
  id: 'null',
  name: '???',
  university: '???',
  members: [],
};

const LegendProblemCol = ({ problem: { label, title, color = 'black' } }) => {
  return (
      <div className="team-problem">
        <div>
        <span title={title}>
          {label}
        </span>
          <span className="team-problem-flag">
            <i className="fas fa-flag" style={{ color }} />
          </span>
        </div>
      </div>
  );
};

const LegendRow = ({ problems }) => {
  const problemCols = problems.map((problem, i) => <LegendProblemCol key={i} problem={problem} />);
  return (
      <div className="card">
        <div className="card-body">
          <div className="team-row">
            <div className="team-rank" />
            <div className="team-solved" />
            <div className="team-name-univ text-ellipsis" />
            <div className="team-problems">
              {problemCols}
            </div>
          </div>
        </div>
      </div>
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
          { attempts >= 2 ? <span>(+{ attempts - 1 })</span> : '-' }
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
      <div className="team-problem">
        <div className={`team-colored-col-bg bg-${status}`} />
        <div className="team-colored-col-fg">{content}</div>
      </div>
  );
};

const TeamRow = ({ entry: { rank, solved, penalty, problems }, team: { name, university, universityJa }, zIndex, className, ...rest }) => {
  const problemCols = problems.map((problem, i) => <TeamProblemCol key={i} problem={problem} />);
  const rewrittenClassName = `${className} card`;
  return (
      <div className={rewrittenClassName} style={{zIndex}} {...rest}>
        <div className="card-body">
          <div className="team-row">
            <div className="team-rank">
              {rank}
            </div>
            <div className="team-solved">
              {solved}
              <br />
              <small>({penalty})</small>
            </div>
            <div className="team-name-univ text-ellipsis">
              {name}
              <br />
              <small>{universityJa || university}</small>
            </div>
            <div className="team-problems">
              {problemCols}
            </div>
          </div>
        </div>
      </div>
  );
};

class DetailedStandingsTableImpl extends React.Component {
  render() {
    const { problems, entries, teams, numRows = 12, offsetRows = 0 } = this.props;
    const rows = [];
    for (let index = 0; index < entries.length; ++index) {
      const entry = entries[index];
      const team = teams[entry.teamId] || DEFAULT_TEAM;
      rows.push(
          <AnimatingStandingsRow
              key={entry.teamId}
              component={TeamRow}
              entry={entry}
              team={team}
              zIndex={9999 - index}
          />
      );
    }
    const rowHeight = 46 + 1;
    const tableHeight = rowHeight * numRows;
    const tableOffset = -rowHeight * offsetRows;
    return (
        <div className="broadcast-detailed-standings">
          <LegendRow problems={problems} />
          <div style={{ overflow: 'hidden', height: `${tableHeight}px` }}>
            <div style={{ position: 'relative', top: `${tableOffset}px` }}>
              <AnimatingTable>
                {rows}
              </AnimatingTable>
            </div>
          </div>
        </div>
    );
  }
}

const mapStateToProps = ({ feeds: { standings: { problems, entries }, teams } }) => ({ problems, entries, teams });

const DetailedStandingsTable =
    connect(mapStateToProps)(DetailedStandingsTableImpl);

export default DetailedStandingsTable;
