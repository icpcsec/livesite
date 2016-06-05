import React from 'react';

const FrontContent = ({ contest }) => (
  <div>
    <h1 className="page-header">
      { contest.title }
    </h1>
    <p>
      ここにいろいろ書く
    </p>
  </div>
);

export default FrontContent;
