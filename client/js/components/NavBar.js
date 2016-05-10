import React from 'react';
import { Link, IndexLink } from 'react-router';
import { sprintf } from 'sprintf-js';

class NavLink extends React.Component {
  render() {
    const { router } = this.context;
    const { onlyActiveOnIndex = false, to, children, ...props } = this.props;
    const isActive = router.isActive(to, onlyActiveOnIndex);
    return (
      <li className={isActive ? 'active' : ''}>
        <Link to={to} {...props}>{children}</Link>
      </li>
    );
  }
};
NavLink.contextTypes = { router: () => React.PropTypes.func.isRequired };

class Clock extends React.Component {
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
    return <p className="navbar-text clock">{this.state.text}</p>;
  }
};

const NavBar = ({ contest }) => (
  <nav className="navbar navbar-inverse">
    <div className="container">
      <div className="navbar-header">
        <Link className="navbar-brand" to="/">{ contest.title }</Link>
      </div>
      <div className="collapse navbar-collapse">
        <ul className="nav navbar-nav">
          <NavLink to="/standings/">順位表</NavLink>
          <NavLink to="/team/">チーム一覧</NavLink>
        </ul>
        <ul className="nav navbar-nav navbar-right">
          <li>
            <Clock contest={contest} />
          </li>
        </ul>
      </div>
    </div>
  </nav>
);

export default NavBar;
