import React from 'react';
import { Link, IndexLink } from 'react-router';
import { sprintf } from 'sprintf-js';
import { tr } from '../i18n';
import siteconfig from '../siteconfig';

class NavLink extends React.Component {
  render() {
    const { router } = this.context;
    const { onlyActiveOnIndex = false, to, children } = this.props;
    const disabled = !to || to.length == 0;
    const external = !disabled && !to.startsWith('/');
    const isActive = disabled || external ? false : router.isActive(to, onlyActiveOnIndex);
    const link =
      disabled ? <a href="javascript:void(0)">{children}</a> :
      external ? <a target="_blank" href={to}>{children}</a> :
      <Link to={to}>{children}</Link>;
    return (
      <li className={`${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
        {link}
      </li>
    );
  }
};
NavLink.contextTypes = { router: () => React.PropTypes.func.isRequired };

const RealtimeIndicator = ({ realtime }) => {
  if (realtime === true || realtime === null) {
    return <span />;
  }
  return (
    <p className="navbar-text">
      <span className="glyphicon glyphicon-flash" title="Real-time websocket connection is not available." />
    </p>
  );
};

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

const NavBar = ({ contest, realtime }) => {
  return (
    <nav className="navbar navbar-inverse navbar-fixed-top" style={{ zIndex: 1000000 }}>
      <div className="container">
        <div className="navbar-header">
          <Link className="navbar-brand" to="/">{ contest.title }</Link>
        </div>
        <div className="collapse navbar-collapse">
          <ul className="nav navbar-nav">
            <NavLink to="/" onlyActiveOnIndex={true}>{tr('Home', 'ホーム')}</NavLink>
            <NavLink to="/standings/">{tr('Standings', '順位表')}</NavLink>
            <NavLink to="/team/">{tr('Teams', 'チーム一覧')}</NavLink>
            {
              siteconfig.ui.streaming_nicolive_id ?
              <NavLink to="/streaming/">{tr('Streaming', '中継')}</NavLink> :
              null
            }
            {
              contest.problemLink && contest.problemLink.length > 0 ?
              <NavLink to={contest.problemLink}>{tr('Problems', '問題')}</NavLink> :
              null
            }
          </ul>
          <ul className="nav navbar-nav navbar-right">
            <RealtimeIndicator realtime={realtime} />
            <NavLink to="/settings/">
              <span className="glyphicon glyphicon-cog"></span>
            </NavLink>
            <li>
              <Clock contest={contest} />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
