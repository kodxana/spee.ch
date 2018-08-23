import React from 'react';
import { Link } from 'react-router-dom';

const AssetPreview = (props) => {
  const {defaultThumbnail, claimData} = props;
  const {name, claimId, fileExt, contentType, thumbnail, channelName, certificateId} = claimData;
  const embedUrl = `/${claimId}/${name}.${fileExt}`;
  const showUrl = `/${channelName}:${certificateId}/${name}`;
  return (
    <Link to={showUrl} >
      {(() => {
        switch (contentType) {
          case 'image/jpeg':
          case 'image/jpg':
          case 'image/png':
          case 'image/gif':
            return (
              <img
                className={'asset-preview-image'}
                src={embedUrl}
                alt={name}
              />
            );
          case 'video/mp4':
            return (
              <img
                className={'asset-preview-video'}
                src={thumbnail || defaultThumbnail}
                alt={name}
              />
            );
          default:
            return (
              <p>unsupported file type</p>
            );
        }
      })()}
    </Link>
  );
};

export default AssetPreview;
