import React from 'react';
import {connect} from 'react-redux';

import FeedsContext from './FeedsContext';
import {FeedsLoader} from '../../loader';

class FeedsProviderImpl extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loader: null };
  }

  static getDerivedStateFromProps({ dispatch }, { loader }) {
    if (!loader) {
      loader = new FeedsLoader(dispatch);
    }
    return { loader };
  }

  render() {
    return (
        <FeedsContext.Provider value={this.state.loader}>
          {this.props.children}
        </FeedsContext.Provider>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({ dispatch });

const FeedsProvider = connect(undefined, mapDispatchToProps, undefined, {pure: false})(FeedsProviderImpl);

export default FeedsProvider;
