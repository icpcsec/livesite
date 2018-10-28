import { connect } from 'react-redux';

import BroadcastClockPane from './BroadcastClockPane';

const mapStateToProps = ({ contest: { times } }) => ({ times });

const BroadcastClockPaneContainer =
    connect(mapStateToProps, undefined, undefined, { pure: false })(BroadcastClockPane);

export default BroadcastClockPaneContainer;
