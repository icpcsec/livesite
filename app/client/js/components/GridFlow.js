import React from 'react';

const GridFlow = ({ cols, children }) => {
  const colClassName = `col-xs-${cols}`;
  const elements = children.map((e) => <div className={colClassName}>{e}</div>);
  return (
    <div className="row">
      {elements}
    </div>
  );
};

export default GridFlow;
