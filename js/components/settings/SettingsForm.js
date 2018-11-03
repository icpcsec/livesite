import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../../actions/index';
import MaterialInit from '../common/MaterialInit';
import { tr } from '../../i18n';

const SettingsFormImpl = ({ settings, toggleSetting }) => (
  <MaterialInit>
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="form-group">
        <div className="switch">
          <label>
            <input
              type="checkbox"
              checked={settings.invertColor}
              onChange={() => toggleSetting('invertColor')} />
            {tr('Enable dark coloring (suitable for projecting)', '背景を黒くする(プロジェクター向き)')}
          </label>
        </div>
        <div className="switch">
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

const mapStateToProps = ({ settings }) => ({ settings });

const mapDispatchToProps = (dispatch) => ({
  toggleSetting(name) {
    dispatch(actions.toggleSetting(name));
  },
});

const SettingsForm =
    connect(mapStateToProps, mapDispatchToProps)(SettingsFormImpl);

export default SettingsForm;
