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
    const { start, end } = this.props.contest.times;
    const now = new Date().getTime() / 1000;
    let text;
    if (now < start) {
      const delta = start - now;
      text = sprintf(
        'Starts in %d:%02d:%02d',
        Math.floor(delta / 60 / 60),
        Math.floor(delta / 60) % 60,
        Math.floor(delta) % 60);
    } else {
      const delta = Math.max(0, end - now);
      text = sprintf(
        '%d:%02d:%02d',
        Math.floor(delta / 60 / 60),
        Math.floor(delta / 60) % 60,
        Math.floor(delta) % 60);
    }
    this.setState({ text });
  }

  componentWillMount() {
    this.updateText();
    this._timer = setInterval(() => this.updateText(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this._timer);
  }

  render() {
    return <span>{this.state.text}</span>;
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
            <p className="navbar-text"><Clock contest={contest} /></p>
          </li>
        </ul>
      </div>
    </div>
  </nav>
);

export default NavBar;
