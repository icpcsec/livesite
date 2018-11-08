import React from 'react';
import {connect} from 'react-redux';

import DataModel from './DataModel';
import DataContext from './DataContext';

class DataProviderImpl extends React.Component {
  constructor(props) {
    super(props);
    this.state = { model: null };
  }

  static getDerivedStateFromProps({ dispatch }, { model }) {
    if (!model) {
      model = new DataModel(dispatch);
    }
    return { model };
  }

  render() {
    return (
        <DataContext.Provider value={this.state.model}>
          {this.props.children}
        </DataContext.Provider>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({ dispatch });

const DataProvider = connect(undefined, mapDispatchToProps, undefined, {pure: false})(DataProviderImpl);

export default DataProvider;
