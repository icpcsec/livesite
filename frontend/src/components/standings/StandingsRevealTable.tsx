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
import { shallowEqual } from 'react-redux';
import { setRevealData, setRevealStep } from '../../actions/index';
import { StandingsHistory } from '../../data';

import { useAppDispatch, useAppSelector } from '../../redux';
import StandingsTable from './StandingsTable';

function StandingsUploadForm() {
  const { loaded } = useAppSelector((state) => {
    return { loaded: state.reveal.reveal.entriesList.length !== 0 };
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

  if (loaded) {
    return null;
  }
  return (
    <div>
      <p>
        Please select reveal JSON files:
        <input type="file" multiple={true} onChange={onChange} />
      </p>
      <p>
        Use arrow keys to navigate (right arrow: forward, left arrow: backward).
      </p>
    </div>
  );
}

export default function StandingsRevealTable() {
  const { numSteps, step } = useAppSelector(
    ({
      reveal: {
        reveal: { entriesList },
        step,
      },
    }) => ({
      numSteps: entriesList.length,
      step,
    })
  );
  const dispatch = useAppDispatch();
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        if (e.keyCode === 39) {
          // ArrowRight
          dispatch(setRevealStep(Math.min(step + 1, numSteps - 1)));
        } else if (e.keyCode === 37) {
          // ArrowLeft
          dispatch(setRevealStep(Math.max(step - 1, 0)));
        }
      }
    },
    [dispatch]
  );
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  return numSteps === 0 ? (
    <StandingsUploadForm />
  ) : (
    <StandingsTable revealMode={true} />
  );
}
