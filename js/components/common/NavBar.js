import React from 'react';
import { Link, Route, Switch } from 'react-router-dom';

import ClockTextContainer from './ClockTextContainer';
import { tr } from '../../i18n';

class NavLink extends React.Component {
  render() {
    const { exact, to, children } = this.props;
    const external = !to.startsWith('/');
    if (external) {
      return (
          <li>
            <a className="nav-link" target="_blank" href={to}>{children}</a>
          </li>
      );
    }
    const link = <Link className="nav-link" to={to}>{children}</Link>;
    return (
        <Switch>
          <Route exact={exact} path={to}>
            <li className="active">{link}</li>
          </Route>
          <Route>
            <li>{link}</li>
          </Route>
        </Switch>
    );
  }
}

const NavBar = ({ contest }) => {
  return (
    <nav className="navbar navbar-expand-md navbar-dark fixed-top" style={{ zIndex: 1000000, backgroundColor: 'var(--indigo)' }}>
      <div className="container">
        <Link className="navbar-brand" to="/">{ contest.title }</Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar_collapse" aria-controls="navbar_collapse" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div id="navbar_collapse" className="collapse navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <NavLink exact to="/">{tr('Home', 'ホーム')}</NavLink>
            <NavLink to="/standings/">{tr('Standings', '順位表')}</NavLink>
            <NavLink to="/team/">{tr('Teams', 'チーム一覧')}</NavLink>
            {
              contest.problemLink && contest.problemLink.length > 0 ?
              <NavLink to={contest.problemLink}>{tr('Problems', '問題')}</NavLink> :
              null
            }
          </ul>
          <ul className="navbar-nav mr-2">
            <NavLink to="/settings/">
              <i className="fas fa-cog"></i>
            </NavLink>
          </ul>
          <span className="navbar-brand clock">
            <ClockTextContainer />
          </span>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;