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
import { connect } from 'react-redux';

class PrefectureViewImpl extends React.Component {
  componentDidMount() {
    this.refresh_();
  }

  componentDidUpdate() {
    this.refresh_();
  }

  refresh_() {
    const teamsByPrefecture = {};
    for (let i = 1; i <= 48; ++i) {
      teamsByPrefecture[i] = [];
    }
    this.props.teams.forEach((team) => {
      teamsByPrefecture[team.prefecture || 48].push(team);
    });
    const areas = [];
    for (let i = 1; i <= 47; ++i) {
      areas.push({
        code: i,
        name: `(${teamsByPrefecture[i].length})`,
        prefectures: [i],
      });
    }
    $('#prefectures')
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
        onSelect: ({ code }) => {
          const $target = $(`#pref${code}`);
          if ($target.length > 0) {
            $(document).scrollTop($target.offset().top - 80);
          }
        },
      });
  }

  render() {
    // TODO: Support high-DPI devices.
    // Until then, we can not show the map in narrow viewport.
    return (
      <div
        className="d-none d-md-block"
        style={{ textAlign: 'center', marginBottom: '24px' }}
      >
        <div id="prefectures" />
      </div>
    );
  }
}

function mapStateToProps({ feeds: { teams: teamsMap } }) {
  const teams = Object.keys(teamsMap).map((key) => teamsMap[key]);
  return { teams };
}

const PrefectureView = connect(mapStateToProps)(PrefectureViewImpl);

export default PrefectureView;
