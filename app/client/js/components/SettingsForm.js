import React from 'react';

import MaterialInit from './MaterialInit';
import { tr } from '../i18n';

const SettingsForm = ({ settings, toggleSetting }) => (
  <MaterialInit>
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="form-group">
        <div className="togglebutton">
          <label>
            <input
              type="checkbox"
              checked={settings.invertColor}
              onChange={() => toggleSetting('invertColor')} />
            {tr('Enable dark coloring (suitable for projecting)', '背景を黒くする(プロジェクター向き)')}
          </label>
        </div>
      </div>
      <div className="form-group">
        <div className="togglebutton">
          <label>
            <input
              type="checkbox"
              checked={settings.autoscroll}
              onChange={() => toggleSetting('autoscroll')} />
            {tr('Enable autoscrolling in standings page', '順位表ページで自動的にスクロールする')}
          </label>
        </div>
      </div>
    </form>
  </MaterialInit>
);

export default SettingsForm;
