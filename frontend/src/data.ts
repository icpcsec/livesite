// Copyright 2020 LiveSite authors
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

export type ContestFeed = {
  title: string;
  times: ContestTimes;
};

export type ContestTimes = {
  start: number;
  end: number;
  freeze: number;
  scale?: number;
};

export type Problem = {};

export type StandingsEntry = {
  teamId: string;
  rank: string;
  problems: StandingsProblemEntry[];
};

export type StandingsProblemEntry = {
  solved: boolean;
  attempts: number;
  pendings: number;
};

export type StandingsFeed = {
  problems: Problem[];
  entries: StandingsEntry[];
};

export type Team = {
  id: string;
  name: string;
  university: string;
  members: TeamMember[];
};

export type TeamMember = {};

export type TeamsFeed = Record<string, Team>;

export type AllFeeds = {
  contest: ContestFeed;
  teams: TeamsFeed;
  standings: StandingsFeed;
};

export type FeedName = keyof AllFeeds;

export type StandingsHistory = {
  problems: Problem[];
  entriesList: StandingsEntry[][];
};
