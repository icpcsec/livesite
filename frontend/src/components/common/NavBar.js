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
import { Link, Route, Switch } from 'react-router-dom';

import ClockText from './ClockText';
import { tr } from '../../i18n';

class NavLink extends React.Component {
  render() {
    const { exact, to, children } = this.props;
    const external = !to.startsWith('/');
    if (external) {
      return (
        <li>
          <a className="nav-link" target="_blank" href={to}>
            {children}
          </a>
        </li>
      );
    }
    const link = (
      <Link className="nav-link" to={to}>
        {children}
      </Link>
    );
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

function NavBarImpl({ contest }) {
  return (
    <nav
      className="navbar navbar-expand-md navbar-dark fixed-top"
      style={{ zIndex: 1000000, backgroundColor: 'var(--indigo)' }}
    >
      <div className="container">
        <Link className="navbar-brand" to="/">
          {contest.title}
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbar_collapse"
          aria-controls="navbar_collapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div id="navbar_collapse" className="collapse navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <NavLink exact to="/">
              {tr('Home', 'ホーム')}
            </NavLink>
            <NavLink to="/standings/">{tr('Standings', '順位表')}</NavLink>
            <NavLink to="/team/">{tr('Teams', 'チーム一覧')}</NavLink>
            {contest.problemLink && contest.problemLink.length > 0 ? (
              <NavLink to={contest.problemLink}>
                {tr('Problems', '問題')}
              </NavLink>
            ) : null}
          </ul>
          <ul className="navbar-nav mr-2">
            <NavLink to="/settings/">
              <i className="fas fa-cog" />
            </NavLink>
          </ul>
          <span className="navbar-brand clock">
            <ClockText />
          </span>
        </div>
      </div>
    </nav>
  );
}

function mapStateToProps({ feeds: { contest } }) {
  return { contest };
}

const NavBar = connect(mapStateToProps, undefined, undefined, { pure: false })(
  NavBarImpl
);

export default NavBar;
