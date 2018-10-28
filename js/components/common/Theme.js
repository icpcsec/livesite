import React from 'react';

const LIGHT_STYLES = (
  'body { color: #000 !important }'
);

const DARK_STYLES = (
  'body { color: #fff !important; background-color: #303030 !important; }' +
  '.navbar { background-color: #212121 !important; }' +
  '.card { background-color: #424242 !important; }' +
  '.form-control { color: #e0e0e0 !important; }' +
  'textarea { background-color: #303030 !important; }' +
  '.standings .team-row.sticky { background-color: #616161 !important; }'
);

const Theme = ({ settings }) => {
  if (settings.invertColor) {
    return <style>{DARK_STYLES}</style>;
  }
  return <style>{LIGHT_STYLES}</style>;
};

export default Theme;
