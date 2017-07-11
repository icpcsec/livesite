import React from 'react';
import { Link } from 'react-router';
import shallowCompare from 'react-addons-shallow-compare';

export const achievementColor = (solved, numProblems) => {
  // HACK: Assume 8 problems if there is no problem settings.
  const actualNumProblems = numProblems || 8;

  if (solved == 0) {
    return '#eee';
  }
  // Range is 180...-90
  const hue = 180 - (solved - 1) / (actualNumProblems - 1) * 270;
  return `hsl(${hue}, 80%, 55%)`;
};

export class TeamCol extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  render() {
    const { text, small, to, ...rest } = this.props;
    const content = <span>{text}<br /><small>{small}</small></span>;
    const inner =
        to ? <Link to={to} className="no-decoration">{content}</Link> : content;
    return <td {...rest}>{inner}</td>;
  }
}

export const TeamPinCol = ({ pinned, onClick }) => {
  const className =
    'glyphicon glyphicon-pushpin' + (pinned ? ' pinned' : '');
  return (
    <td className="team-mark">
      <span className={className} onClick={onClick} />
    </td>
  );
};

export const RevealMarker = () => (
  // .reveal-marker is used to compute the marker position in StandingsRevealTable.
  <div className="reveal-marker" style={{ position: 'relative', pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', bottom: '1px', boxShadow: '0 0 0 5px red' }}>
      <table className="team-table" style={{ background: 'transparent' }}>
        <tbody>
          <tr>
            <TeamCol text="a" small="b" style={{ opacity: 0 }} />
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);
