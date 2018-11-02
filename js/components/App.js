import React from 'react';
import { Provider } from 'react-redux';

import Routes from './Routes';
import DocumentTitleContainer from './common/DocumentTitleContainer';
import FeedsProvider from './data/FeedsProvider';

const App = ({ store }) => (
    <Provider store={store}>
      <FeedsProvider>
        <DocumentTitleContainer>
          <Routes />
        </DocumentTitleContainer>
      </FeedsProvider>
    </Provider>
);

export default App;
