import React from 'react';
import ChannelLoginForm from '@containers/ChannelLoginForm';
import ChannelCreateForm from '@containers/ChannelCreateForm';
import Row from '@components/Row';

const ChannelTools = () => {
  return (
    <div>
      <Row>
        <h3>Zaloguj się do istniejącego kanału:</h3>
        <ChannelLoginForm />
      </Row>
      <Row>
        <h3>Stwórz nowy kanał:</h3>
        <ChannelCreateForm />
      </Row>
    </div>
  );
};

export default ChannelTools;
