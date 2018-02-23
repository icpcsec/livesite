import React from 'react';

const Footer = ({ contest }) => (
  <footer>
    <div className="container" style={{ textAlign: 'right' }}>
      {contest.title}
    </div>
  </footer>
);

export default Footer;
