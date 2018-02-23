import { connect } from 'react-redux';

import Theme from '../components/Theme';

const mapStateToProps = ({ settings }) => ({ settings });

const ThemeContainer = connect(mapStateToProps)(Theme);

export default ThemeContainer;
