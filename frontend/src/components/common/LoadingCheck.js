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

import {connect} from 'react-redux';

function LoadingCheckImpl({ loaded, children, loading }) {
  return loaded ? children : loading;
}

function mapStateToProps(state, ownProps) {
  const loaded = ['contest', 'teams', 'standings'].every(
      (feed) => state.feeds.loaded.has(feed));
  return { loaded, ...ownProps };
}

const LoadingCheck = connect(mapStateToProps, undefined, undefined, {pure: false})(LoadingCheckImpl);

export default LoadingCheck;
