import { connect } from 'react-redux';

import Theme from './Theme';

const mapStateToProps = ({ settings }) => ({ settings });

const ThemeContainer = connect(mapStateToProps)(Theme);

export default ThemeContainer;
