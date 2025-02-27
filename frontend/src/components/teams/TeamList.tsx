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

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import FixedRatioThumbnail from '../common/FixedRatioThumbnail';
import GridFlow from '../common/GridFlow';
import * as constants from '../../constants';
import siteconfig from '../../siteconfig';
import { Team, TeamsFeed } from '../../data';
import { useAppSelector } from '../../redux';

type TeamPhotoProps = {
  photo: string;
};

function TeamPhoto({ photo }: TeamPhotoProps) {
  return (
    <FixedRatioThumbnail url={photo} ratio={siteconfig.ui.photoAspectRatio} />
  );
}

type TeamLinkProps = {
  id: string;
  children: React.ReactNode;
};

function TeamLink({ id, children }: TeamLinkProps) {
  if (!siteconfig.features.teamPage) {
    return <>{children}</>;
  }
  return (
    <Link to={`/team/${id}`} className="no-decoration">
      {children}
    </Link>
  );
}

type TeamItemProps = {
  teamId: string;
  team: Team;
  highlight?: boolean;
};

function TeamItem({
  teamId,
  team: { name, university, country, photo, members },
  highlight,
}: TeamItemProps) {
  const displayNames = [];
  for (const profile of members) {
    const { name } = profile;
    const displayName = name.length > 0 ? name : '?';
    displayNames.push(displayName);
  }
  const hasInfo = members.some((profile) => profile.name.length > 0);
  const memberNames = displayNames.join(' / ');
  return (
    <div
      className={'card mb-3' + (highlight ? ' team-highlight' : undefined)}
      style={{ backgroundColor: hasInfo ? undefined : 'inherit !important' }}
      id={teamId}
    >
      <div className="card-body">
        {siteconfig.features.photo ? (
          <div className="mb-3">
            <TeamLink id={teamId}>
              <TeamPhoto photo={photo!} />
            </TeamLink>
          </div>
        ) : null}
        <h4 className="mb-1 text-ellipsis" title={name}>
          <TeamLink id={teamId}>{name}</TeamLink>
        </h4>
        <div className="text-ellipsis">
          <TeamLink id={teamId}>
            {siteconfig.features.country ? (
              <img
                src={`/images/${country}.png`}
                style={{
                  width: '21px',
                  height: '14px',
                  marginRight: '3px',
                  marginBottom: '2px',
                  border: '1px solid #000',
                }}
              />
            ) : null}
            <span title={university}>{university}</span>
          </TeamLink>
        </div>
        {memberNames ? (
          <div className="text-ellipsis" style={{ paddingTop: '6px' }}>
            <TeamLink id={teamId}>{memberNames}</TeamLink>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type TeamItemFlowProps = {
  children: React.ReactNode;
};

function TeamItemFlow({ children }: TeamItemFlowProps) {
  return <GridFlow className="col-md-6 col-lg-4">{children}</GridFlow>;
}

type TeamListSimpleProps = {
  teams: TeamsFeed;
};

function TeamListSimple({ teams }: TeamListSimpleProps) {
  const { hash } = useLocation();
  const highlightTeamId = hash.length > 1 ? hash.slice(1) : null;
  console.log(highlightTeamId);
  const items = Object.keys(teams)
    .sort(
      (a, b) =>
        teams[a].university.localeCompare(teams[b].university) ||
        teams[a].name.localeCompare(teams[b].name) ||
        a.localeCompare(b)
    )
    .map((id) => (
      <TeamItem
        key={id}
        teamId={id}
        team={teams[id]}
        highlight={highlightTeamId === id}
      />
    ));
  return <TeamItemFlow>{items}</TeamItemFlow>;
}

type TeamListWithPrefectureProps = {
  teams: TeamsFeed;
};

function TeamListWithPrefecture({ teams }: TeamListWithPrefectureProps) {
  const teamsByPrefecture: Record<number, TeamItemProps[]> = {};
  for (let i = 1; i <= 48; ++i) {
    teamsByPrefecture[i] = [];
  }
  for (const [id, team] of Object.entries(teams)) {
    teamsByPrefecture[team.prefecture || 48].push({ teamId: id, team });
  }
  const children = [];
  for (let i = 1; i <= 48; ++i) {
    const teamsInPrefecture = teamsByPrefecture[i];
    teamsInPrefecture.sort(
      (a, b) =>
        a.team.university.localeCompare(b.team.university) ||
        a.team.name.localeCompare(b.team.name) ||
        a.teamId.localeCompare(b.teamId)
    );
    const count = teamsInPrefecture.length;
    if (count > 0) {
      const items = teamsInPrefecture.map((item) => (
        <TeamItem key={item.teamId} {...item} />
      ));
      const name = constants.PREFECTURES[i];
      children.push(
        <h3
          key={`pref${i}.h`}
          id={`pref${i}`}
          className="my-3"
        >{`${name} (${count})`}</h3>
      );
      children.push(<TeamItemFlow key={`pref${i}.s`}>{items}</TeamItemFlow>);
    }
  }
  return <div>{children}</div>;
}

export default function TeamList() {
  const teams = useAppSelector((state) => state.feeds.teams);
  if (siteconfig.features.prefecture) {
    return <TeamListWithPrefecture teams={teams} />;
  }
  return <TeamListSimple teams={teams} />;
}
