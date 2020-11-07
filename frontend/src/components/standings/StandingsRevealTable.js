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

import * as actions from '../../actions/index';
import {StandingsTableImpl} from './StandingsTable';

class StandingsUploadForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
  }

  onChange(e) {
    this.setState({ loaded: true });
    const loader = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(e.target.files[0]);
    });
    loader.then((text) => JSON.parse(text)).then((reveal) => {
      this.props.onLoaded(reveal);
    });
  }

  render() {
    if (this.state.loaded) {
      return null;
    }
    return (
      <div>
        <p>
          Please select reveal JSON files:
          <input type="file"
                 multiple="multiple"
                 onChange={this.onChange.bind(this)} />
        </p>
        <p>
          Use arrow keys to navigate (right arrow: forward, left arrow: backward).
        </p>
      </div>
    );
  }
}

class StandingsRevealTableImpl extends React.Component {
  constructor(props) {
    super(props);
    this.keyDownListener_ = this.onKeyDown.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyDownListener_);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyDownListener_);
  }

  onKeyDown(e) {
    const { step, numSteps } = this.props;
    if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      if (e.keyCode === 39) {  // ArrowRight
        this.props.setStep(Math.min(step + 1, numSteps - 1));
      } else if (e.keyCode === 37) {  // ArrowLeft
        this.props.setStep(Math.max(step - 1, 0));
      }
    }
  }

  onLoaded(reveal) {
    this.props.setData(reveal);
  }

  getSnapshotBeforeUpdate() {
    return document.scrollingElement.scrollTop;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    document.scrollingElement.scrollTop = snapshot;
  }

  render() {
    const { teams, entries, problems } = this.props;
    return entries.length === 0 ?
      <StandingsUploadForm onLoaded={this.onLoaded.bind(this)} /> :
      <StandingsTableImpl
          revealMode={true}
          teams={teams}
          entries={entries}
          problems={problems}
          pinnedTeamIds={[]}
          togglePin={(teamId) => {}}
      />;
  }
}

function mapStateToProps({ feeds: { teams }, reveal: { reveal: { entriesList, problems }, step } }) {
  const entries = entriesList[step];
  return {
    teams,
    entries,
    problems,
    step,
    numSteps: entriesList.length,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setStep(step) {
      dispatch(actions.setRevealStep(step));
    },

    setData(reveal) {
      dispatch(actions.setRevealData(reveal));
    },
  };
}

const StandingsRevealTable =
    connect(mapStateToProps, mapDispatchToProps)(StandingsRevealTableImpl);

export default StandingsRevealTable;
