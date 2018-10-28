import { connect } from 'react-redux';

import AutoScroller from './AutoScroller';

const mapStateToProps = ({ settings }) => ({ enabled: settings.autoscroll });

const AutoScrollerContainer = connect(mapStateToProps)(AutoScroller);

export default AutoScrollerContainer;
