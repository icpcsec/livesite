import { connect } from 'react-redux';

import * as actions from '../actions';
import SettingsForm from '../components/SettingsForm';

const mapStateToProps = ({ settings }) => ({ settings });

const mapDispatchToProps = (dispatch) => ({
  toggleSetting(name) {
    dispatch(actions.toggleSetting(name));
  },
});

const SettingsFormContainer =
  connect(mapStateToProps, mapDispatchToProps)(SettingsForm);

export default SettingsFormContainer;
