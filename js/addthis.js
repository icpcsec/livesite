import siteconfig from './siteconfig';

window.addthis_share = window.addthis_share || {};
const addthis = window.addthis_share;

export const setup = () => {
  addthis.passthrough = addthis.passthrough || {};
  addthis.passthrough.twitter = {
    via: siteconfig.ui.twitter_id,
  };
};

export const handleNavigation = () => {
  addthis.url = window.location.href;
  addthis.title = `${window.document.title} - ${$('h1').text()}`;
};
