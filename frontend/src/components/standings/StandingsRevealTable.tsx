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

import React, { ChangeEvent, useCallback, useEffect } from 'react';
import {
  setRevealData,
  setRevealStep,
  toggleSetting,
} from '../../actions/index';
import { StandingsHistory } from '../../data';

import { useAppDispatch, useAppSelector } from '../../redux';
import StandingsTable from './StandingsTable';
import { tr } from '../../i18n';
import MaterialInit from '../common/MaterialInit';

function StandingsUploadForm() {
  const { loaded, invertColor } = useAppSelector((state) => {
    const entries = state.reveal.reveal.entriesList;
    return {
      loaded: entries.length > 0 && entries[0].length > 0,
      invertColor: state.settings.invertColor,
    };
  });
  const dispatch = useAppDispatch();
  const onChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (!reader.result) {
            reject(reader.error);
          } else {
            resolve(reader.result as string);
          }
        };
        reader.readAsText(e.target.files![0]);
      });
      const reveal = JSON.parse(text) as StandingsHistory;
      dispatch(setRevealData(reveal));
    },
    [loaded, dispatch]
  );
  const toggleInvertColor = useCallback(() => {
    dispatch(toggleSetting('invertColor'));
  }, [dispatch]);

  if (loaded) {
    return null;
  }
  return (
    <MaterialInit>
      <div>
        <p>
          Please select reveal JSON files:
          <input type="file" multiple={true} onChange={onChange} />
        </p>
        <p>
          Use arrow keys to navigate (right arrow: forward, left arrow:
          backward).
        </p>
        <div className="form-group mt-3">
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
        </div>
      </div>
    </MaterialInit>
  );
}

export default function StandingsRevealTable() {
  const { entries, step } = useAppSelector(
    ({
      reveal: {
        reveal: { entriesList },
        step,
      },
    }) => ({
      entries: entriesList,
      step,
    })
  );
  const dispatch = useAppDispatch();
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        if (e.keyCode === 39) {
          // ArrowRight
          dispatch(setRevealStep(Math.min(step + 1, entries.length - 1)));
        } else if (e.keyCode === 37) {
          // ArrowLeft
          dispatch(setRevealStep(Math.max(step - 1, 0)));
        }
      }
    },
    [dispatch, step, entries]
  );
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  return entries.length === 0 || entries[0].length == 0 ? (
    <StandingsUploadForm />
  ) : (
    <StandingsTable revealMode={true} />
  );
}
