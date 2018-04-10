import { connect } from 'react-redux';

import FrontContent from '../components/FrontContent';

const mapStateToProps = ({ contest }) => ({ contest });

const FrontContentContainer = connect(mapStateToProps)(FrontContent);

export default FrontContentContainer;
