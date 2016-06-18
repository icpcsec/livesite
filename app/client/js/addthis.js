window.addthis_share = window.addthis_share || {};
const addthis_share = window.addthis_share;

export const setup = () => {
  addthis_share.passthrough = addthis_share.passthrough || {};
  addthis_share.passthrough.twitter = {
    via: 'icpc2016tsukuba',
  };
};

export const handleNavigation = () => {
  addthis_share.url = window.location.href;
  addthis_share.title = `${window.document.title} - ${$('h1').text()}`;
};
