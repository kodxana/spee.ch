import React from 'react';

const ChannelInfoDisplay = ({name, longId, shortId}) => {
  return (
    <div>
      <h2>nazwa kanału: {name}</h2>
      <p className={'text--secondary'}>pełne id kanału: {longId}</p>
      <p className={'text--secondary'}>krótkie id kanału: {shortId}</p>
    </div>
  );
};

export default ChannelInfoDisplay;
