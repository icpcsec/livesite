import React from 'react';

import MaterialInit from './MaterialInit';

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
            Enable dark coloring (good for projecting)
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
            Enable autoscrolling in standings page
          </label>
        </div>
      </div>
    </form>
  </MaterialInit>
);

export default SettingsForm;
