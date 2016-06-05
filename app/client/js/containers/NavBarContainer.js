import React from 'react';
import { connect } from 'react-redux';

import NavBar from '../components/NavBar';

const mapStateToProps = ({ contest }) => ({ contest });

const mapDispatchToProps = (dispatch) => ({});

const NavBarContainer =
  connect(mapStateToProps, mapDispatchToProps, undefined, { pure: false })(NavBar);

export default NavBarContainer;
