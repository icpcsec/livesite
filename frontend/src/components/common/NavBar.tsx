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
import { Link, Route, Switch } from 'react-router-dom';

import ClockText from './ClockText';
import { tr } from '../../i18n';
import { useAppSelector } from '../../redux';

function NavLink({
  exact,
  to,
  children,
}: {
  exact?: boolean;
  to: string;
  children: React.ReactNode;
}) {
  const external = !to.startsWith('/');
  if (external) {
    return (
      <li>
        <a className="nav-link" target="_blank" href={to} rel="noreferrer">
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

export default function NavBar() {
  const { title, problemLink } = useAppSelector(
    ({
      feeds: {
        contest: { title, problemLink },
      },
    }) => ({ title, problemLink })
  );
  return (
    <nav
      className="navbar navbar-expand-md navbar-dark fixed-top"
      style={{ zIndex: 1000000, backgroundColor: 'var(--indigo)' }}
    >
      <div className="container">
        <Link
          className="navbar-brand text-truncate"
          to="/"
          // Workaround to use ellipsis for long contest name.
          // calculated maxWidth by:
          // - 1rem (right margin of navbar-brand)
          // - 1.5rem (left and right paddings of navbar-toggler)
          // - 1.5em (width of navbar-toggler-icon)
          // - 2px (borders of navbar-toggler-icon)
          // - 1px additional margin.
          style={{ maxWidth: 'calc(100% - 1.5em - 2.5rem - 3px)' }}
        >
          {title}
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
            {problemLink && problemLink.length > 0 ? (
              <NavLink to={problemLink}>{tr('Problems', '問題')}</NavLink>
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
