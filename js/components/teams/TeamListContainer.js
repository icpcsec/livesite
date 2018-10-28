import { connect } from 'react-redux';

import TeamList from './TeamList';

const mapStateToProps = (state) => {
  const teams = Object.keys(state.teams).map((key) => state.teams[key]);
  return { teams };
};

const TeamListContainer = connect(mapStateToProps)(TeamList);

export default TeamListContainer;
