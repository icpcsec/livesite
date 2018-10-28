import { connect } from 'react-redux';

import NavBar from './NavBar';

const mapStateToProps = ({ contest }) => ({ contest });

const NavBarContainer =
  connect(mapStateToProps, undefined, undefined, { pure: false })(NavBar);

export default NavBarContainer;
