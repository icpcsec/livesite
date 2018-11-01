import React from 'react';
import ReactGA from 'react-ga';

class GA extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromProps({ history }) {
    return { path: history.location.pathname };
  }

  componentDidMount() {
    const { path } = this.state;
    ReactGA.pageview(path);
  }

  componentDidUpdate(prevProps, prevState) {
    const { path: prevPath } = prevState;
    const { path } = this.state;
    if (path !== prevPath) {
      ReactGA.pageview(path);
    }
  }

  render() {
    return null;
  }
}

export default GA;
