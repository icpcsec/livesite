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
import { Team } from '../../data';
import { useAppSelector } from '../../redux';

export default function PrefectureView() {
  const teams = useAppSelector((state) => state.feeds.teams);
  const [dom, setDom] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!dom) {
      return;
    }

    const teamsByPrefecture: Record<number, Team[]> = {};
    for (let i = 1; i <= 48; ++i) {
      teamsByPrefecture[i] = [];
    }
    for (const team of Object.values(teams)) {
      teamsByPrefecture[team.prefecture ?? 48].push(team);
    }
    const areas = [];
    for (let i = 1; i <= 47; ++i) {
      areas.push({
        code: i,
        name: `(${teamsByPrefecture[i].length})`,
        prefectures: [i],
      });
    }
    $(dom)
      .empty()
      .japanMap({
        width: 732,
        selection: 'area',
        areas: areas,
        color: '#bdbdbd',
        lineColor: '#bdbdbd',
        fontColor: '#000',
        hoverColor: '#ff9100',
        lineWidth: 1,
        drawsBoxLine: true,
        showsPrefectureName: false,
        showsAreaName: true,
        movesIslands: true,
        fontSize: 11,
        onSelect: ({ code }: { code: number }) => {
          const $target = $(`#pref${code}`);
          if ($target.length > 0) {
            $(document).scrollTop($target.offset()!.top - 80);
          }
        },
      });
  }, [dom]);

  // TODO: Support high-DPI devices.
  // Until then, we can not show the map in narrow viewport.
  return (
    <div
      className="d-none d-md-block"
      style={{ textAlign: 'center', marginBottom: '24px' }}
    >
      <div ref={setDom} />
    </div>
  );
}
