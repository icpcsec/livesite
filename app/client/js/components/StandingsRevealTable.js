import React from 'react';

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
    Promise.all(promises).then((jsonList) => {
      let standingsList;
      if (jsonList.length == 1 && jsonList[0].reveal) {
        standingsList = jsonList[0].reveal;
      } else {
        jsonList.sort((a, b) => (a.index - b.index));
        standingsList = jsonList.map((json) => json.standings);
      }
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
};

class StandingsRevealTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      standingsList: [[]],
      standings: [],
      standingsIndex: 0,
    };
    this._keyDownListener = this.onKeyDown.bind(this);
    this._scrolling = false;
  }

  componentDidMount() {
    document.addEventListener('keydown', this._keyDownListener);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._keyDownListener);
  }

  componentDidUpdate() {
    // No reveal marker in the final state.
    if (this.state.standingsIndex === this.state.standingsList.length - 1) {
      return;
    }
    const $marker = $('.reveal-marker');
    const scrollTop =
      $marker.length > 0 ?
      $marker.offset().top - $(window).height() * 2 / 3 :
      1000000;
    $('body').animate({ scrollTop }, 500);
    this._scrolling = true;
    setTimeout(() => { this._scrolling = false; }, 500);
  }

  onKeyDown(e) {
    if (this._scrolling || $('.animating').length > 0) {
      return;
    }
    if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      if (e.keyCode == 39) {  // ArrowRight
        this.setStandingsIndex(
          Math.min(this.state.standingsIndex + 1, this.state.standingsList.length - 1));
      } else if (e.keyCode == 37) {  // ArrowLeft
        this.setStandingsIndex(
          Math.max(this.state.standingsIndex - 1, 0));
      }
    }
  }

  setStandingsIndex(standingsIndex) {
    this.setState({
      standingsIndex,
      standings: this.state.standingsList[standingsIndex],
    });
  }

  onLoaded(standingsList) {
    this.setState({
      standingsList: standingsList,
      standings: standingsList[0],
      standingsIndex: 0,
    });
  }

  render() {
    return this.state.standings.length == 0 ?
      <StandingsUploadForm onLoaded={this.onLoaded.bind(this)} /> :
      <StandingsTable revealMode={true} standings={this.state.standings} {...this.props} />;
  }
}

export default StandingsRevealTable;
