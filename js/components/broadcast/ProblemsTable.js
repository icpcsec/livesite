import React from 'react';
import {connect} from 'react-redux';

const Box = ({ children }) => (
    <span style={{ display: 'inline-block', minWidth: '2ex', textAlign: 'right' }}>
      {children}
    </span>
);

const ProblemRow = ({ problem: { label, color, accepts, rejects } }) => (
    <div className="card">
      <div className="card-body">
        <div className="problem-row">
          <div className="problem-label">
            {label}
          </div>
          <div className="problem-flag">
            <i className="fas fa-flag" style={{ color }} />
          </div>
          <div className="problem-stats">
            <Box>{accepts}</Box>
            {' / '}
            <Box>{accepts + rejects}</Box>
          </div>
        </div>
      </div>
    </div>
);

class ProblemsTableImpl extends React.Component {
  render() {
    const { problems } = this.props;
    const rows = problems.map((problem) => <ProblemRow key={problem.label} problem={problem} />);
    return (
        <div className="broadcast-problems">
          {rows}
        </div>
    );
  }
}

const mapStateToProps = ({ feeds: { standings: { problems, entries } } }) => {
  const problemStats = [];
  if (entries.length > 0) {
    for (const problem of problems) {
      problemStats.push(Object.assign(
          {},
          problem,
          { accepts: 0, rejects: 0 }));
    }
    for (const entry of entries) {
      for (let i = 0; i < problemStats.length; ++i) {
        const problem = entry.problems[i];
        const stats = problemStats[i];
        if (problem.solved > 0) {
          stats.accepts++;
          stats.rejects += problem.attempts - 1;
        } else {
          stats.rejects += problem.attempts;
        }
      }
    }
  }
  return { problems: problemStats };
};

const ProblemsTable = connect(mapStateToProps)(ProblemsTableImpl);

export default ProblemsTable;
