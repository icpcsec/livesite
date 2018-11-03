import { connect } from 'react-redux';

import BroadcastEventsPane from './BroadcastEventsPane';

const mapStateToProps = ({ events, teams, standings: { problems } }) => ({ events, teams, problems });

const BroadcastEventsPaneContainer =
    connect(mapStateToProps)(BroadcastEventsPane);

export default BroadcastEventsPaneContainer;
