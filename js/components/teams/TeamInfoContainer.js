import { connect } from 'react-redux';

import TeamInfo from './TeamInfo';

const mapStateToProps = (state, ownProps) => {
  const { teams } = state;
  const team = teams[ownProps.params.requestedTeamId];
  return { team };
};

const TeamInfoContainer = connect(mapStateToProps)(TeamInfo);

export default TeamInfoContainer;
