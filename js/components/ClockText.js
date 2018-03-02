import React from "react";
import {sprintf} from "sprintf-js";

class ClockText extends React.Component {
  updateText() {
    const { start = 0, end = 0, scale = 1 } = this.props.contest.times;
    const now = new Date().getTime() / 1000;
    const delta = Math.max(end, now) - Math.max(start, now);
    const deltaScaled = delta * scale;
    const text = sprintf(
        '%d:%02d:%02d',
        Math.floor(deltaScaled / 60 / 60),
        Math.floor(deltaScaled / 60) % 60,
        Math.floor(deltaScaled) % 60);
    this.setState({ text });
  }

  componentWillMount() {
    this.updateText();
    const { scale = 1 } = this.props.contest.times;
    const updateInterval = Math.max(1000 / scale, 100);
    this._timer = setInterval(() => this.updateText(), updateInterval);
  }

  componentWillUnmount() {
    clearInterval(this._timer);
  }

  render() {
    return <span>{this.state.text}</span>;
  }
}

export default ClockText;
