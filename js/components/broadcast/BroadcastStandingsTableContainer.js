import { connect } from 'react-redux';

import BroadcastStandingsTable from './BroadcastStandingsTable';

const mapStateToProps = ({ standings: { entries }, teams }) => ({ entries, teams });

const BroadcastStandingsTableContainer =
    connect(mapStateToProps)(BroadcastStandingsTable);

export default BroadcastStandingsTableContainer;
