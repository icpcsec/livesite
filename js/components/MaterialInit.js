import React from 'react';

class MaterialInit extends React.Component {
  componentDidMount() {
    $.material.init();
  }

  render() {
    return <div>{this.props.children}</div>
  }
}

export default MaterialInit;
