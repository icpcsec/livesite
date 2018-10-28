import React from 'react';

const GridFlow = ({ className, children }) => {
  const elements = children.map(
      (e, i) => <div key={i} className={className}>{e}</div>);
  return (
    <div className="row">
      {elements}
    </div>
  );
};

export default GridFlow;
