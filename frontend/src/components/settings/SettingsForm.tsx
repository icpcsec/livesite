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

import React, { useCallback } from 'react';

import * as actions from '../../actions/index';
import MaterialInit from '../common/MaterialInit';
import { tr } from '../../i18n';
import { useAppDispatch, useAppSelector } from '../../redux';

export default function SettingsForm() {
  const { invertColor, autoscroll } = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();
  const toggleInvertColor = useCallback(() => {
    dispatch(actions.toggleSetting('invertColor'));
  }, [dispatch]);
  const toggleAutoscroll = useCallback(() => {
    dispatch(actions.toggleSetting('autoscroll'));
  }, [dispatch]);

  return (
    <MaterialInit>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <div className="switch">
            <label>
              <input
                type="checkbox"
                checked={invertColor}
                onChange={toggleInvertColor}
              />
              {tr(
                'Enable dark coloring (suitable for projecting)',
                '背景を黒くする(プロジェクター向き)'
              )}
            </label>
          </div>
          <div className="switch">
            <label>
              <input
                type="checkbox"
                checked={autoscroll}
                onChange={toggleAutoscroll}
              />
              {tr(
                'Enable autoscrolling in standings page',
                '順位表ページで自動的にスクロールする'
              )}
            </label>
          </div>
        </div>
      </form>
    </MaterialInit>
  );
}
