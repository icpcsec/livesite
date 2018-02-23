import React from 'react';

class LoadingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { seconds: 0 };
  }

  componentDidMount() {
    this.timer_ = setInterval(
        () => this.setState({ seconds: this.state.seconds + 1 }),
        500);
  }

  componentWillUnmount() {
    clearInterval(this.timer_);
  }

  render() {
    const message = 'Loading.' + '.'.repeat(this.state.seconds % 3);
    return (
      <div className="container">
        <h1 className="page-header">
          {message}
        </h1>
      </div>
    );
  }
};

export default LoadingPage;
