import { connect } from 'react-redux';

import PrefectureView from '../components/PrefectureView';

const mapStateToProps = (state) => {
  const teams = Object.keys(state.teams).map((key) => state.teams[key]);
  return { teams };
};

const PrefectureViewContainer = connect(mapStateToProps)(PrefectureView);

export default PrefectureViewContainer;
