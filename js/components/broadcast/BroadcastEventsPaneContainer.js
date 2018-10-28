import { connect } from 'react-redux';

import BroadcastEventsPane from './BroadcastEventsPane';

const mapStateToProps = ({ events, teams, contest: { problems } }) => ({ events, teams, problems });

const BroadcastEventsPaneContainer =
    connect(mapStateToProps)(BroadcastEventsPane);

export default BroadcastEventsPaneContainer;
