import { connect } from 'react-redux';

import NavBar from '../components/NavBar';

const mapStateToProps = ({ contest }) => ({ contest });

const NavBarContainer =
  connect(mapStateToProps, undefined, undefined, { pure: false })(NavBar);

export default NavBarContainer;
