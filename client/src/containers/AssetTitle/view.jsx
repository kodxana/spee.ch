import React from 'react';
import Row from '@components/Row';

const AssetTitle = ({ title, editable, channel, name, shortId }) => {
  return (
    <Row>
      <h3>
        {title}
        {editable && (<span> (<a href={`/edit/${channel}:${shortId}/${name}`}>edit</a>)</span>)}
      </h3>
    </Row>
  );
};

export default AssetTitle;
