import React from 'react';
import { Provider } from 'react-redux';

import DefaultRoutes from './DefaultRoutes';
import DocumentTitleContainer  from './common/DocumentTitleContainer';
import LoadingCheckContainer from './common/LoadingCheckContainer';
import LoadingPage from './LoadingPage';
import BroadcastRoutes from './broadcast/BroadcastRoutes';

class App extends React.Component {
  render() {
    const { store, broadcastMode } = this.props;
    if (broadcastMode) {
      return (
        <Provider store={store}>
          <LoadingCheckContainer loading={<div className="loading" />}>
            <BroadcastRoutes />
          </LoadingCheckContainer>
        </Provider>
      );
    }
    return (
      <Provider store={store}>
        <LoadingCheckContainer loading={<LoadingPage/>}>
          <DocumentTitleContainer>
            <DefaultRoutes />
          </DocumentTitleContainer>
        </LoadingCheckContainer>
      </Provider>
    );
  }
}

export default App;
