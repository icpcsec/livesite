import React from 'react';

import SettingsFormContainer from './SettingsFormContainer';
import { tr } from '../../i18n';

const SettingsPage = () => (
  <div>
    <h1 className="my-4">
      {tr('Settings', '設定')}
    </h1>
    <SettingsFormContainer />
  </div>
);

export default SettingsPage;
