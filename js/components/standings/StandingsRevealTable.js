import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../../actions/index';
import StandingsTable from './StandingsTable';

class StandingsUploadForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
  }

  onChange(e) {
    this.setState({ loaded: true });
    const promises = Array.from(e.target.files).map((file) => {
      const loader = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(file);
      });
      return loader.then((text) => JSON.parse(text));
    });
    Promise.all(promises).then((reveal) => {
      const { standingsList } = reveal;
      this.props.onLoaded(standingsList);
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
    this.scrolling_ = false;
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyDownListener_);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyDownListener_);
  }

  componentDidUpdate() {
    // No reveal marker in the final state.
    if (this.props.standingsIndex === this.props.numStandings - 1) {
      return;
    }
    const $marker = $('.reveal-marker');
    const scrollTop =
      $marker.length > 0 ?
      $marker.offset().top - $(window).height() * 2 / 3 :
      1000000;
    this.scrolling_ = true;
    $('html, body').animate({ scrollTop }, 500, () => {
      this.scrolling_ = false;
    });
  }

  onKeyDown(e) {
    if (this.scrolling_) {
      return;
    }
    if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      if (e.keyCode === 39) {  // ArrowRight
        this.props.setStandingsIndex(
          Math.min(this.props.standingsIndex + 1, this.props.numStandings - 1));
      } else if (e.keyCode === 37) {  // ArrowLeft
        this.props.setStandingsIndex(
          Math.max(this.props.standingsIndex - 1, 0));
      }
    }
  }

  onLoaded(standingsList) {
    this.props.setStandingsList(standingsList);
  }

  render() {
    return this.props.entries.length === 0 ?
      <StandingsUploadForm onLoaded={this.onLoaded.bind(this)} /> :
      <StandingsTable revealMode={true} entries={this.props.entries} {...this.props} />;
  }
}

const mapStateToProps = ({ feeds: { teams, standings: { entries, problems } }, reveal: { standingsList, standingsIndex } }) => {
  const standings = standingsList[standingsIndex];
  return {
    teamsMap: teams,
    pinnedTeamIds: [],
    togglePin: (teamId) => {},
    entries,
    problems,
    standingsIndex,
    numStandings: standingsList.length,
  };
};

const mapDispatchToProps = (dispatch) => ({
  setStandingsIndex(index) {
    dispatch(actions.setRevealStandingsIndex(index));
  },

  setStandingsList(standingsList) {
    dispatch(actions.setRevealStandingsList(standingsList));
  },
});

const StandingsRevealTable =
    connect(mapStateToProps, mapDispatchToProps)(StandingsRevealTableImpl);

export default StandingsRevealTable;
