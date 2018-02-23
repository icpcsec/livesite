import React from 'react';

const FrontContent = ({ contest }) => (
  <div dangerouslySetInnerHTML={{ __html: contest.frontPageHtml }} />
);

export default FrontContent;
