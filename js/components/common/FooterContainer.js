import { connect } from 'react-redux';

import Footer from './Footer';

const mapStateToProps = ({ contest }) => ({ contest });

const FooterContainer = connect(mapStateToProps)(Footer);

export default FooterContainer;
