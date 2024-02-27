// Copyright 2019 LiveSite authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useEffect, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Event, EventType, Problem, Team } from '../../data';
import { useAppSelector } from '../../redux';

const EVENT_TIMEOUT_SECONDS = 20;

function EventRow({
  team,
  problem,
  event,
}: {
  team: Team;
  problem: Problem;
  event: Event;
}) {
  const rankCol =
    event.type === 'solved' ? (
      <div style={{ flex: '0 0 auto', marginLeft: '12px' }}>
        {event.oldRank} &#x21D2; {event.newRank}
      </div>
    ) : null;
  const teamLabel = team
    ? team.universityShort
      ? `${team.universityShort} / ${team.name}`
      : team.name
    : '???';
  return (
    <div className="card">
      <div className="card-body" style={{ display: 'flex' }}>
        <div
          className={`bg-${event.type}`}
          style={{
            flex: '0 0 auto',
            width: '18px',
            marginRight: '4px',
            textAlign: 'center',
          }}
        >
          {problem.label}
        </div>
        <div className="text-ellipsis" style={{ flex: '1 1 auto' }}>
          {teamLabel}
        </div>
        {rankCol}
      </div>
    </div>
  );
}

function computeActiveEvents(events: Event[]): Event[] {
  const activeEvents = [];
  const now = new Date().getTime() / 1000;
  for (const e of events) {
    if (now - e.time <= EVENT_TIMEOUT_SECONDS) {
      activeEvents.push(e);
    }
  }
  activeEvents.reverse();
  return activeEvents;
}

function EventsTable() {
  const { teams, problems, allEvents } = useAppSelector(
    ({
      feeds: {
        teams,
        standings: { problems },
      },
      events: allEvents,
    }) => ({ teams, problems, allEvents })
  );
  const [activeEvents, setActiveEvents] = useState(() =>
    computeActiveEvents(allEvents)
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveEvents(computeActiveEvents(allEvents));
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [allEvents]);

  const rows = [];
  for (const event of activeEvents) {
    const { eventId, teamId, problemIndex } = event;
    const team = teams[teamId];
    const problem = problems[problemIndex];
    rows.push(
      <CSSTransition
        key={eventId}
        timeout={{ enter: 500, exit: 300 }}
        classNames="event-animation"
      >
        <EventRow key={eventId} team={team} problem={problem} event={event} />
      </CSSTransition>
    );
  }
  return (
    <div
      className="events"
      style={{
        display: 'flex',
        flexDirection: 'column-reverse',
        width: '100%',
        height: '100%',
      }}
    >
      <TransitionGroup component={null}>{rows}</TransitionGroup>
    </div>
  );
}

function EventsOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        top: '140px',
        width: '340px',
        zIndex: 1000000,
        pointerEvents: 'none',
      }}
    >
      <EventsTable />
    </div>
  );
}

export default EventsOverlay;
