import React from 'react';

const ErrorMessage = ({ header, body }) => (
  <div>
    <div className="page-header">
      <h1>{header}</h1>
    </div>
    <p>{body}</p>
  </div>
);

export default ErrorMessage;
