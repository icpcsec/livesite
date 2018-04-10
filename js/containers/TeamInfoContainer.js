import { connect } from 'react-redux';

import TeamInfo from '../components/TeamInfo';

const mapStateToProps = (state, ownProps) => {
  const { teams } = state;
  const team = teams[ownProps.params.requestedTeamId];
  return { team };
};

const TeamInfoContainer = connect(mapStateToProps)(TeamInfo);

export default TeamInfoContainer;
