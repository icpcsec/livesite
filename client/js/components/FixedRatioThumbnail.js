import React from 'react';
import normalizeUrl from 'normalizeurl';

const FixedRatioThumbnail = ({ url, ratio }) => {
  const paddingTop = 100 * ratio + '%';
  const backgroundImage = `url("${url}")`;
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ paddingTop }}>
        <div style={{
          position: 'absolute',
          left: '0',
          top: '0',
          right: '0',
          bottom: '0',
          backgroundImage: backgroundImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }} />
      </div>
    </div>
  );
};

export default FixedRatioThumbnail;
