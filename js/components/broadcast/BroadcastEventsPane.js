import deepEqual from 'deep-equal';
import React from 'react';
import {CSSTransition, TransitionGroup} from 'react-transition-group';

const EVENT_TIMEOUT_SECONDS = 30;

const EventRow = ({type, team, problem, oldRank, newRank}) => {
  return (
    <div className="card broadcast-card">
      <div className={`card-body card-event-${type} text-ellipsis`}>
        <span className="mark" style={{ marginRight: '4px' }}>
          <span style={{ display: 'inline-block', width: '12px', textAlign: 'center' }}>
            {problem.label}
          </span>
        </span>
        {team.universityShort} {team.name}
      </div>
    </div>
  );
};

class EventTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
    };
  }

  componentDidUpdate() {
    this.updateState_();
  }

  componentDidMount() {
    this.timer_ = setInterval(() => this.updateState_(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer_);
  }

  updateState_() {
    const newEvents = [];
    const now = new Date().getTime() / 1000;
    for (const e of this.props.events) {
      if (now - e.time <= EVENT_TIMEOUT_SECONDS) {
        newEvents.push(e);
      }
    }
    newEvents.reverse();

    if (!deepEqual(this.state.events, newEvents)) {
      this.setState({
        events: newEvents,
      });
    }
  }

  render() {
    const {teams, problems} = this.props;
    const {events} = this.state;
    const rows = [];
    for (const event of events) {
      const {eventId, type, teamId, problemIndex, oldRank, newRank} = event;
      const team = teams[teamId];
      const problem = problems[problemIndex];
      rows.push(
          <CSSTransition key={eventId} timeout={{ enter: 500, exit: 300 }} classNames="event-animation">
            <EventRow key={eventId} type={type} team={team} problem={problem} oldRank={oldRank} newRank={newRank} />
          </CSSTransition>
      );
    }
    return (
      <div style={{display: 'flex', flexDirection: 'column-reverse', width: '100%', height: '100%' }}>
        <TransitionGroup component={null}>
          {rows}
        </TransitionGroup>
      </div>
    );
  }
}

const BroadcastEventsPane = ({ events, teams, problems }) => {
  return (
      <div style={{position: 'absolute', top: '20px', bottom: '20px', left: '20px', width: '240px' }}>
        <EventTable events={events} teams={teams} problems={problems} />
      </div>
  );
};

export default BroadcastEventsPane;
