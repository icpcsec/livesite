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

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { sprintf } from 'sprintf-js';
import isEqual from 'react-fast-compare';

import { updateSettings } from '../../actions/index';
import { tr } from '../../i18n';
import siteconfig from '../../siteconfig';
import AnimatingTable from '../common/AnimatingTable';
import { createAnimatingStandingsRow } from '../common/AnimatingStandingsRow';
import {
  Problem,
  RevealState,
  StandingsEntry,
  StandingsProblemEntry,
  Team,
} from '../../data';
import { useAppDispatch, useAppSelector } from '../../redux';
import { shallowEqual } from 'react-redux';

const DEFAULT_TEAM: Team = {
  name: '???',
  university: '???',
  members: [],
  country: '???',
};

function achievementColor(solved: number, numProblems: number): string {
  // HACK: Assume 8 problems if there is no problem settings.
  const actualNumProblems = numProblems || 8;

  if (solved === 0) {
    return '#eee';
  }
  // Range is 180...-90
  const hue = 180 - ((solved - 1) / (actualNumProblems - 1)) * 270;
  return `hsl(${hue}, 80%, 55%)`;
}

type TeamGenericColProps = {
  text: React.ReactNode;
  small?: React.ReactNode;
  to?: string;
  className?: string;
};

class TeamGenericCol extends React.Component<TeamGenericColProps> {
  shouldComponentUpdate(nextProps: TeamGenericColProps, nextState: {}) {
    return !isEqual(this.props, nextProps);
  }

  render() {
    const { text, small, to, className = '', ...rest } = this.props;
    const rewrittenClassName = 'team-col ' + className;
    const content = (
      <span className="team-generic-col-content">
        {text}
        <br />
        <small>{small}</small>
      </span>
    );
    const inner = to ? (
      <Link to={to} className="no-decoration">
        {content}
      </Link>
    ) : (
      content
    );
    return (
      <div className={rewrittenClassName} {...rest}>
        {inner}
      </div>
    );
  }
}

type LegendProblemColProps = {
  problem: Problem;
};

function LegendProblemCol({
  problem: { label, title, color = 'black' },
}: LegendProblemColProps) {
  return (
    <div className="team-col team-problem">
      <div>
        <span title={title}>{label}</span>
        <span className="team-problem-flag">
          <i className="fas fa-flag d-none d-md-inline" style={{ color }} />
        </span>
      </div>
    </div>
  );
}

type LegendProblemColsProps = {
  problems: Problem[];
};

class LegendProblemCols extends React.Component<LegendProblemColsProps> {
  shouldComponentUpdate(nextProps: LegendProblemColsProps, nextState: {}) {
    return !isEqual(this.props, nextProps);
  }

  render() {
    const { problems } = this.props;
    const problemCols = problems.map((problem, i) => (
      <LegendProblemCol key={i} problem={problem} />
    ));
    return <div className="team-problems">{problemCols}</div>;
  }
}

type LegendRowProps = {
  problems: Problem[];
};

function LegendRow({ problems }: LegendRowProps) {
  return (
    <div className="team-row legend">
      <div className="team-col team-mark"></div>
      <div className="team-col team-rank">#</div>
      <div className="team-col team-score">{tr('Solved', '正答数')}</div>
      <div className="team-col team-name">
        {tr('Team/University', 'チーム/大学')}
      </div>
      <LegendProblemCols problems={problems} />
    </div>
  );
}

type ProblemStat = {
  solved: number;
  attemptTeams: number;
  submissions: number;
};

type FooterProblemColProps = {
  problemStat: ProblemStat;
};

function FooterProblemCol({
  problemStat: { solved, attemptTeams: attempts, submissions },
}: FooterProblemColProps) {
  return (
    <div className="team-col team-problem">
      <div>
        <span>
          {solved} / {attempts}
          <br />({submissions})
        </span>
      </div>
    </div>
  );
}

type FooterProblemColsProps = {
  problemStats: ProblemStat[];
};

class FooterProblemCols extends React.Component<FooterProblemColsProps> {
  shouldComponentUpdate(nextProps: FooterProblemColsProps, nextState: {}) {
    return !isEqual(this.props, nextProps);
  }

  render() {
    const { problemStats } = this.props;
    const problemCols = problemStats.map((problemStat, i) => (
      <FooterProblemCol key={i} problemStat={problemStat} />
    ));
    return <div className="team-problems">{problemCols}</div>;
  }
}

type FooterRowProps = {
  problemStats: ProblemStat[];
};

function FooterRow({ problemStats }: FooterRowProps) {
  return (
    <div className="team-row footer">
      <div className="team-col team-mark"></div>
      <div className="team-col team-rank"></div>
      <div className="team-col team-score"></div>
      <div className="team-col team-name">
        Solved / Attempted teams
        <br />
        (Submissions)
      </div>
      <FooterProblemCols problemStats={problemStats} />
    </div>
  );
}

type TeamPinColProps = {
  teamId: string;
  pinned: boolean | null;
};

function TeamPinCol({ teamId, pinned }: TeamPinColProps) {
  if (pinned === null) {
    return <div />;
  }

  const pinnedTeamIds = useAppSelector(
    ({ settings: { pinnedTeamIds } }) => pinnedTeamIds
  );
  const dispatch = useAppDispatch();
  const onClick = (): void => {
    const index = pinnedTeamIds.indexOf(teamId);
    const newPinnedTeamIds =
      index < 0
        ? [...pinnedTeamIds, teamId]
        : [...pinnedTeamIds.slice(0, index), ...pinnedTeamIds.slice(index + 1)];
    dispatch(
      updateSettings({
        pinnedTeamIds: { $set: newPinnedTeamIds },
      })
    );
  };

  const className = 'fas fa-thumbtack' + (pinned ? ' pinned' : '');
  return (
    <div className="team-col team-mark">
      <i className={className} onClick={onClick} />
    </div>
  );
}

type TeamRevealStateColProps = {
  revealMode: boolean;
  revealState: RevealState | undefined;
};

function TeamRevealStateCol({
  revealMode,
  revealState,
}: TeamRevealStateColProps) {
  if (!revealMode) {
    return <div />;
  }
  const mark = revealState === 'finalized' && <span className="fas fa-check" />;
  return <div className="team-col team-mark">{mark}</div>;
}

type TeamScoreColProps = {
  solved: number;
  penalty: number;
  problemSpecs: Problem[];
};

function TeamScoreCol({ solved, penalty, problemSpecs }: TeamScoreColProps) {
  const backgroundColor = achievementColor(solved, problemSpecs.length);
  return (
    <div className="team-col team-score">
      <div className="team-colored-col-bg" style={{ backgroundColor }} />
      <div className="team-colored-col-fg">
        {solved}
        <br />
        <small className="d-none d-md-inline">({penalty})</small>
      </div>
    </div>
  );
}

type TeamProblemColProps = {
  problem: StandingsProblemEntry;
  problemSpec: Problem;
  revealMode: boolean;
};

function TeamProblemCol({
  problem: { attempts, penalty, pendings, solved },
  problemSpec: { label },
  revealMode,
}: TeamProblemColProps) {
  let status;
  let content;
  if (solved) {
    status = 'solved';
    const hour = Math.floor(penalty / 60 / 60);
    const minute = Math.floor(penalty / 60) % 60;
    const second = Math.floor(penalty) % 60;
    const time =
      hour > 0
        ? sprintf('%d:%02d:%02d', hour, minute, second)
        : sprintf('%d:%02d', minute, second);
    content = (
      <span>
        {time}
        <br />
        <small>{attempts >= 2 ? <span>(+{attempts - 1})</span> : '-'}</small>
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
    if (revealMode && pendings > 0) {
      content = (
        <span>
          {label} [+{pendings}]
          <br />
          <small>{attempts > 0 ? `(+${attempts})` : null}</small>
        </span>
      );
    } else {
      content = (
        <span>
          -
          <br />
          <small>{attempts > 0 ? `(+${attempts})` : null}</small>
        </span>
      );
    }
  }
  return (
    <div className="team-col team-problem">
      <div className={`team-colored-col-bg bg-${status}`} />
      <div className="team-colored-col-fg">{content}</div>
    </div>
  );
}

type TeamProblemColsProps = {
  problems: StandingsProblemEntry[];
  problemSpecs: Problem[];
  revealMode: boolean;
};

function TeamProblemCols({
  problems,
  problemSpecs,
  revealMode,
}: TeamProblemColsProps) {
  const problemCols = problems.map((problem, i) => (
    <TeamProblemCol
      key={i}
      problem={problem}
      problemSpec={problemSpecs[i]}
      revealMode={revealMode}
    />
  ));
  return <div className="team-problems">{problemCols}</div>;
}

type TeamRowLeftProps = {
  teamId: string;
  pinned: boolean | null;
  revealMode: boolean;
  revealState: RevealState | undefined;
};

class TeamRowLeft extends React.Component<TeamRowLeftProps> {
  shouldComponentUpdate(nextProps: TeamRowLeftProps, nextState: {}) {
    const FIELDS = ['teamId', 'pinned', 'revealMode', 'revealState'] as const;
    const cached = FIELDS.every((f) => isEqual(this.props[f], nextProps[f]));
    return !cached;
  }

  render() {
    const { pinned, teamId, revealMode, revealState } = this.props;
    return (
      <div className="team-left">
        <TeamRevealStateCol revealMode={revealMode} revealState={revealState} />
        <TeamPinCol teamId={teamId} pinned={pinned} />
      </div>
    );
  }
}

type TeamRowRightProps = {
  solved: number;
  penalty: number;
  problemSpecs: Problem[];
  teamId: string;
  team: Team;
  universityRank: string;
  problems: StandingsProblemEntry[];
  revealMode: boolean;
};

class TeamRowRight extends React.Component<TeamRowRightProps> {
  shouldComponentUpdate(nextProps: TeamRowRightProps, nextState: {}) {
    return !isEqual(this.props, nextProps);
  }

  render() {
    const {
      solved,
      penalty,
      problemSpecs,
      teamId,
      team,
      universityRank,
      problems,
      revealMode,
    } = this.props;
    const { name, university, country } = team;
    const universityContent = (
      <span className="university-container">
        <span className="university-name" title={university}>
          {siteconfig.features.country ? (
            <img
              src={`/images/${country}.png`}
              style={{
                width: '19px',
                height: '12px',
                marginRight: '3px',
                marginBottom: '1px',
              }}
            />
          ) : null}
          {university}
        </span>
        <span
          className="university-rank"
          title={`Rank in the university: ${universityRank}`}
        >
          [{universityRank || '???'}]
        </span>
      </span>
    );
    const to = siteconfig.features.teamPage ? `/team/${teamId}` : undefined;
    return (
      <div className="team-right">
        <TeamScoreCol
          solved={solved}
          penalty={penalty}
          problemSpecs={problemSpecs}
        />
        <TeamGenericCol
          className="team-name"
          text={<span title={name}>{name}</span>}
          small={universityContent}
          to={to}
        />
        <TeamProblemCols
          problems={problems}
          problemSpecs={problemSpecs}
          revealMode={revealMode}
        />
      </div>
    );
  }
}

type TeamRowBaseProps = {
  entry: StandingsEntry;
  team: Team;
  universityRank: string;
  problems: Problem[];
  pinned: boolean | null;
  revealMode: boolean;
  className: string;
};

const TeamRow = createAnimatingStandingsRow(
  class TeamRow extends React.Component<TeamRowBaseProps> {
    shouldComponentUpdate(nextProps: TeamRowBaseProps, nextState: {}) {
      const FIELDS = [
        'entry',
        'team',
        'universityRank',
        'problems',
        'pinned',
        'className',
      ] as const;
      const cached = FIELDS.every((f) => isEqual(this.props[f], nextProps[f]));
      return !cached;
    }

    render() {
      const {
        entry,
        team,
        universityRank,
        problems: problemSpecs,
        pinned,
        revealMode,
        className,
        ...rest
      } = this.props;
      const { rank, solved, penalty, revealState, problems = [] } = entry;
      const rewrittenClassName = 'team-row ' + className;
      return (
        <div className={rewrittenClassName} {...rest}>
          <TeamRowLeft
            teamId={entry.teamId}
            pinned={pinned}
            revealMode={revealMode}
            revealState={revealState}
          />
          <TeamGenericCol className="team-rank" text={rank} />
          <TeamRowRight
            solved={solved}
            penalty={penalty}
            problemSpecs={problemSpecs}
            teamId={entry.teamId}
            team={team}
            universityRank={universityRank}
            problems={problems}
            revealMode={revealMode}
          />
        </div>
      );
    }
  }
);

function RevealRow(props: React.ComponentProps<typeof TeamRow>) {
  return (
    <div className="reveal-row no-animation">
      <TeamRow {...props} />
      <div className="reveal-marker" />
    </div>
  );
}

function computeUniversityRanks(
  entries: StandingsEntry[],
  teams: Record<string, Team>
): Record<string, string> {
  const universityToEntries: Record<string, StandingsEntry[]> = {};
  entries.forEach((entry) => {
    const team = teams[entry.teamId];
    if (team) {
      const { university } = team;
      if (universityToEntries[university] === undefined) {
        universityToEntries[university] = [];
      }
      universityToEntries[university].push(entry);
    }
  });
  const universityRanks: Record<string, string> = {};
  Object.keys(universityToEntries).forEach((university) => {
    const entries = universityToEntries[university];
    entries.forEach((entry, index) => {
      if (index > 0 && entry.rank === entries[index - 1].rank) {
        universityRanks[entry.teamId] =
          universityRanks[entries[index - 1].teamId];
      } else {
        universityRanks[entry.teamId] = `${index + 1}/${entries.length}`;
      }
    });
  });
  return universityRanks;
}

function computeProblemStats(entries: StandingsEntry[], problems: Problem[]) {
  const stats: ProblemStat[] = [];
  problems.forEach(() =>
    stats.push({ solved: 0, attemptTeams: 0, submissions: 0 })
  );
  entries.forEach((entry) => {
    entry.problems.forEach((problem, i) => {
      if (problem.solved) {
        stats[i].solved++;
        stats[i].attemptTeams++;
      } else if (problem.attempts > 0) {
        stats[i].attemptTeams++;
      }
      stats[i].submissions += problem.attempts;
    });
  });
  return stats;
}

type StandingsTableProps = {
  revealMode?: boolean;
};

export default function StandingsTable({
  revealMode = false,
}: StandingsTableProps) {
  const { teams, standings, reveal, savedPinnedTeamIds } = useAppSelector(
    ({ feeds: { teams, standings }, reveal, settings: { pinnedTeamIds } }) => ({
      teams,
      standings,
      reveal,
      savedPinnedTeamIds: pinnedTeamIds,
    }),
    shallowEqual
  );
  const entries = revealMode
    ? reveal.reveal.entriesList[reveal.step]
    : standings.entries;
  const problems = revealMode ? reveal.reveal.problems : standings.problems;
  const pinnedTeamIds = revealMode ? [] : savedPinnedTeamIds;
  const pinnedTeamIdSet = new Set(pinnedTeamIds);
  const universityRanks = useMemo(
    () => computeUniversityRanks(entries, teams),
    [entries, teams]
  );
  const problemStats = useMemo(
    () => computeProblemStats(entries, problems),
    [entries, problems]
  );
  const normalRows = [];
  for (let index = 0; index < entries.length; ++index) {
    const entry = entries[index];
    const team = teams[entry.teamId] ?? DEFAULT_TEAM;
    const revealCurrent =
      revealMode &&
      ((index + 1 < entries.length &&
        entry.revealState !== 'finalized' &&
        entries[index + 1].revealState === 'finalized') ||
        (index === entries.length - 1 && entry.revealState !== 'finalized'));
    if (revealCurrent) {
      normalRows.push(
        <RevealRow
          key={'__reveal_marker__'}
          entry={entry}
          team={team}
          problems={problems}
          universityRank={universityRanks[entry.teamId]}
          pinned={null}
          revealMode={revealMode}
          index={0}
          className=""
        />
      );
    }
    normalRows.push(
      <TeamRow
        key={entry.teamId}
        entry={entry}
        team={team}
        problems={problems}
        universityRank={universityRanks[entry.teamId]}
        pinned={pinnedTeamIdSet.has(entry.teamId)}
        revealMode={revealMode}
        index={index}
        className=""
      />
    );
  }
  const pinnedEntries = entries.filter((entry) =>
    pinnedTeamIdSet.has(entry.teamId)
  );
  const stickyRows = pinnedEntries.map((entry) => {
    const team = teams[entry.teamId] ?? DEFAULT_TEAM;
    return (
      <TeamRow
        key={entry.teamId}
        entry={entry}
        team={team}
        universityRank={universityRanks[entry.teamId]}
        problems={problems}
        pinned={true}
        revealMode={false}
        index={0}
        className="sticky"
      />
    );
  });
  return (
    <div className="standard-standings">
      <div
        className={
          revealMode ? 'standings-section' : 'standings-section sticky-heading'
        }
      >
        <LegendRow problems={problems} />
      </div>
      <div className="standings-section">{stickyRows}</div>
      <div className="standings-section">
        <AnimatingTable>{normalRows}</AnimatingTable>
      </div>
      {revealMode ? null : (
        <div className="standings-section">
          <FooterRow problemStats={problemStats} />
        </div>
      )}
    </div>
  );
}
