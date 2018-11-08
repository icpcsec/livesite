import React from 'react';
import {connect} from 'react-redux';

import DataContext from '../data/DataContext';

const Button = ({ text, enabled, onClick }) => (
    <button className={`mr-2 btn btn-raised btn-${enabled ? 'danger' : 'secondary'}`} onClick={onClick}>
      {text}
    </button>
);

const ConfigButton = ({ text, values, broadcast, model }) => {
  const update = {};
  for (const key in values) {
    if (values.hasOwnProperty(key)) {
      update[key] = {$set: values[key]};
    }
  }
  let enabled = true;
  for (const key in values) {
    if (values.hasOwnProperty(key)) {
      if (broadcast[key] !== values[key]) {
        enabled = false;
        break;
      }
    }
  }
  return <Button text={text} enabled={enabled} onClick={() => model.updateBroadcast(update)} />;
};

const CompactStandingsButtons = ({ broadcast, entries, model }) => {
  const PAGE_SIZE = 20;
  const buttons = [];
  for (let i = 0; i * PAGE_SIZE < entries.length; ++i) {
    const text = `${i * PAGE_SIZE + 1}...${(i + 1) * PAGE_SIZE}`;
    buttons.push(
        <ConfigButton key={i} text={text} values={{ view: 'normal', page: i }} broadcast={broadcast} model={model} />);
  }
  return (
      <div>
        <ConfigButton text="auto" values={{ view: 'normal', page: -1 }} broadcast={broadcast} model={model} />
        <div className="btn-group" style={{ display: 'inline' }}>{buttons}</div>
      </div>
  );
};

const DetailedStandingsButtons = ({ broadcast, entries, model }) => {
  const PAGE_SIZE = 12;
  const buttons = [];
  for (let i = 0; i * PAGE_SIZE < entries.length; ++i) {
    const text = `${i * PAGE_SIZE + 1}...${(i + 1) * PAGE_SIZE}`;
    buttons.push(
        <ConfigButton key={i} text={text} values={{ view: 'detailed', page: i }} broadcast={broadcast} model={model} />);
  }
  return (
      <div>
        <ConfigButton text="auto" values={{ view: 'detailed', page: -1 }} broadcast={broadcast} model={model} />
        {buttons}
      </div>
  );
};

const ConfigPanelImpl = ({ broadcast, entries, model }) => {
  const { signedIn } = broadcast;
  return (
      <div className="broadcast-config">
        <Button
            text={signedIn ? 'Signed In' : 'Sign In'}
            enabled={!signedIn}
            onClick={() => (signedIn ? (window.confirm('Sign out?') ? model.signOut() : null) : model.signIn())} />

        <h3 className="mt-3">Simple Views</h3>
        <ConfigButton text="Clock Only" values={{ view: 'none' }} broadcast={broadcast} model={model} />
        <ConfigButton text="Problems" values={{ view: 'problems' }} broadcast={broadcast} model={model} />

        <h3 className="mt-3">Normal Standings</h3>
        <CompactStandingsButtons broadcast={broadcast} entries={entries} model={model} />

        <h3 className="mt-3">Detailed Standings</h3>
        <DetailedStandingsButtons broadcast={broadcast} entries={entries} model={model} />
      </div>
  );
};

const withModel = (Component) => {
  class NewComponent extends React.Component {
    render() {
      return <Component model={this.context} {...this.props} />;
    }
  }
  NewComponent.contextType = DataContext;
  return NewComponent;
};

const mapStateToProps = ({ broadcast, feeds: { standings: { entries } } }) => ({ broadcast, entries });

const ConfigPanel = withModel(connect(mapStateToProps)(ConfigPanelImpl));

export default ConfigPanel;
