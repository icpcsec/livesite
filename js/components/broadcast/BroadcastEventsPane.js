import React from 'react';

const MAX_ROWS = 10;

const EventRow = ({type, team, problem, oldRank, newRank}) => {
  const mark = type === 'accept' ? '✔' : '✘';
  return (
    <div className="card broadcast-card">
      <div className={`card-body card-event-${type} text-ellipsis`}>
        <span className="mark" style={{ marginRight: '4px' }}>
          <span style={{ display: 'inline-block', width: '16px', textAlign: 'center' }}>
            {problem.label}
          </span>
          <span style={{ display: 'inline-block', width: '16px', textAlign: 'center' }}>
            {mark}
          </span>
        </span>
        {team.universityShort} {team.name}
      </div>
    </div>
  );
};

const BroadcastEventsPane = ({ events, teams, problems }) => {
  const now = new Date().getTime() / 1000;
  const rows = [];
  for (let eventIndex = events.length - 1; eventIndex >= 0 && rows.length < MAX_ROWS; --eventIndex) {
    const event = events[eventIndex];
    const {eventId, type, time, teamId, problemIndex, oldRank, newRank} = event;
    if (now - time >= 30) {
      continue;
    }
    const team = teams[teamId];
    const problem = problems[problemIndex];
    rows.push(
      <EventRow key={eventId} type={type} team={team} problem={problem} oldRank={oldRank} newRank={newRank} />
    );
  }
  return (
      <div style={{position: 'absolute', top: '20px', bottom: '20px', left: '20px', width: '240px' }}>
        <div style={{display: 'flex', flexDirection: 'column-reverse', width: '100%', height: '100%' }}>
          {rows}
        </div>
      </div>
  );
};

export default BroadcastEventsPane;
