import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../actions';
import Theme from '../components/Theme';

const mapStateToProps = ({ settings }) => ({ settings });

const ThemeContainer = connect(mapStateToProps)(Theme);

export default ThemeContainer;
