import { connect } from 'react-redux';

import FrontContent from '../components/FrontContent';

const mapStateToProps = ({ contest }) => ({ contest });

const mapDispatchToProps = (dispatch) => ({});

const FrontContentContainer =
  connect(mapStateToProps, mapDispatchToProps)(FrontContent);

export default FrontContentContainer;
