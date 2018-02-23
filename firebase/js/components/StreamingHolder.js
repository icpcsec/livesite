import React from 'react';

import * as siteconfig from '../siteconfig';

const EMBED_SCRIPT_URL_BASE = 'http://ext.live.nicovideo.jp/generateembedtag?idType=ch&width=800&height=450&v=4&autoLoad=1';

class StreamingHolder extends React.Component {
  constructor(props) {
    super(props);
    this._loaded = false;
  }

  componentWillReceiveProps(newProps) {
    if (newProps.y && siteconfig.ui.streaming_nicolive_id && !this._loaded) {
      document.write = (html) => {
        document.write = undefined;
        this._player.innerHTML = html;
      };
      const script = document.createElement('script');
      script.setAttribute(
        'src',
        EMBED_SCRIPT_URL_BASE + '&id=' + siteconfig.ui.streaming_nicolive_id);
      this._player.appendChild(script);
      this._loaded = true;
    }
  }

  render() {
    const style = { position: 'absolute' };
    if (this.props.y) {
      style.left = `${this.props.x}px`;
      style.top = `${this.props.y}px`;
    } else {
      style.left = '0';
      style.top = '-1000000px';
    }
    return <div style={style} ref={(c) => { this._player = c; }} />;
  }
};

export default StreamingHolder;
