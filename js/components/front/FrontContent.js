import React from 'react';
import {connect} from 'react-redux';

const FrontContentImpl = ({ contest }) => (
  <div dangerouslySetInnerHTML={{ __html: contest.frontPageHtml }} />
);

const mapStateToProps = ({ contest }) => ({ contest });

const FrontContent = connect(mapStateToProps)(FrontContentImpl);

export default FrontContent;
