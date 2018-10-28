import React from 'react';

const Footer = ({ contest }) => (
  <footer>
    <div className="container-fluid" style={{ textAlign: 'right' }}>
      {contest.title}
    </div>
  </footer>
);

export default Footer;
