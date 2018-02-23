import React from 'react';
import { connect } from 'react-redux';

import Footer from '../components/Footer';

const mapStateToProps = ({ contest }) => ({ contest });

const FooterContainer = connect(mapStateToProps)(Footer);

export default FooterContainer;
