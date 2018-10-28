import { connect } from 'react-redux';

import BroadcastStandingsTable from './BroadcastStandingsTable';

const mapStateToProps = ({ standings, teams }) => ({ standings, teams });

const BroadcastStandingsTableContainer =
    connect(mapStateToProps)(BroadcastStandingsTable);

export default BroadcastStandingsTableContainer;
