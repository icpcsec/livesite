import siteconfig from './siteconfig';

export const tr = (en, ja) => {
  return siteconfig.ui.lang === 'ja' ? ja : en;
};
