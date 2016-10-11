import React from 'react';

class StreamingScreen extends React.Component {
  componentDidMount() {
    const x = this._player.offsetLeft;
    const y = this._player.offsetTop;
    this.props.showStreaming(x, y);
  }

  componentWillUnmount() {
    this.props.hideStreaming();
  }

  render() {
    return (
      <div
        style={{ width: '800px', height: '450px', marginLeft: 'auto', marginRight: 'auto' }}
        ref={(c) => { this._player = c; }}
      />
    );
  }
};

export default StreamingScreen;
