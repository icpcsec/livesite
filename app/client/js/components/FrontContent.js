import React from 'react';

const FrontContent = ({ contest }) => (
  <div>
    <h1 className="page-header">
      { contest.title }
    </h1>
    <div dangerouslySetInnerHTML={{ __html: contest.frontPageHtml }} />
  </div>
);

export default FrontContent;
