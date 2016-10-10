import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../actions';
import AutoScroller from '../components/AutoScroller';

const mapStateToProps = ({ settings }) => ({ enabled: settings.autoscroll });

const AutoScrollerContainer = connect(mapStateToProps)(AutoScroller);

export default AutoScrollerContainer;
