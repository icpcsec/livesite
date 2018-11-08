import React from 'react';
import { Provider } from 'react-redux';

import Routes from './Routes';
import DocumentTitleUpdater from './common/DocumentTitleUpdater';
import DataProvider from './data/DataProvider';

const App = ({ store }) => (
    <Provider store={store}>
      <DataProvider>
        <DocumentTitleUpdater>
          <Routes />
        </DocumentTitleUpdater>
      </DataProvider>
    </Provider>
);

export default App;
