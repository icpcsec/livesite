import React from 'react';

class MaterialInit extends React.Component {
  componentDidMount() {
    $(this._dom).bootstrapMaterialDesign();
  }

  render() {
    return (
      <div ref={(dom) => { this._dom = dom; }}>
        {this.props.children}
      </div>
    );
  }
}

export default MaterialInit;
