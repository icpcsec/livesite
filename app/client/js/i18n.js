import * as siteconfig from './siteconfig';

export const tr = (en, ja) => {
  return siteconfig.JA ? ja : en;
};
