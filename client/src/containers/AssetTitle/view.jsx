import React from 'react';
import { Link } from 'react-router-dom';
import Row from '@components/Row';

const AssetTitle = ({ title, editable, channel, name, shortId }) => {
  return (
    <Row>
      <h3>
        {title}
        {editable && (<span> (<Link to={`/edit/${channel}:${shortId}/${name}`}>edit</Link>)</span>)}
      </h3>
    </Row>
  );
};

export default AssetTitle;
