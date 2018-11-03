import React from 'react';
import { Provider } from 'react-redux';

import Routes from './Routes';
import DocumentTitleUpdater from './common/DocumentTitleUpdater';
import FeedsProvider from './data/FeedsProvider';

const App = ({ store }) => (
    <Provider store={store}>
      <FeedsProvider>
        <DocumentTitleUpdater>
          <Routes />
        </DocumentTitleUpdater>
      </FeedsProvider>
    </Provider>
);

export default App;
