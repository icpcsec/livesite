import React from 'react';

import SettingsForm from './SettingsForm';
import { tr } from '../../i18n';

const SettingsPage = () => (
  <div>
    <h1 className="my-4">
      {tr('Settings', '設定')}
    </h1>
    <SettingsForm />
  </div>
);

export default SettingsPage;
