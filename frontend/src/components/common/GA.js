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
import ReactGA from 'react-ga';
import { withRouter } from 'react-router-dom';

class GAImpl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromProps({ history }) {
    return { path: history.location.pathname };
  }

  componentDidMount() {
    const { path } = this.state;
    ReactGA.pageview(path);
  }

  componentDidUpdate(prevProps, prevState) {
    const { path: prevPath } = prevState;
    const { path } = this.state;
    if (path !== prevPath) {
      ReactGA.pageview(path);
    }
  }

  render() {
    return null;
  }
}

const GA = withRouter(GAImpl);

export default GA;
