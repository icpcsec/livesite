import React from 'react';
import { connect } from 'react-redux';

const FooterImpl = ({ contest }) => (
  <footer>
    <div className="container-fluid" style={{ textAlign: 'right' }}>
      {contest.title}
    </div>
  </footer>
);

const mapStateToProps = ({ feeds: { contest } }) => ({ contest });

const Footer = connect(mapStateToProps)(FooterImpl);

export default Footer;
