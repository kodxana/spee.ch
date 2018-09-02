import React from 'react';
import Row from '@components/Row';

const AboutSpeechDetails = () => {
  return (
    <div>
      <Row>
        <p className={'text--large'}>
          Spee.ch jest witryną obsługującą media, która czyta i publikuje treści na blockchainie <a className='link--primary' href='https://lbry.io'>LBRY</a>.
        </p>
        <p className={'text--large'}>
          Spee.ch jest stroną hostingową, ale z dodatkową korzyścią, przechowuje twoje treści na zdecentralizowanej sieci komputerów -- <a className='link--primary' href='https://lbry.io/get'>LBRY</a> network.  Oznacza to, że zdjęcia są przechowywane w wielu lokalizacjach bez żadnego punktu awarii.
        </p>
      </Row>
      <Row>
        <h3>Współpraca</h3>
        <p className={'text--large'}>
          Jeśli masz pomysł na własną stronę podobną do podanej wyżej, sklonuj nasze <a className='link--primary' href='https://github.com/lbryio/spee.ch'>repozytorium</a> i do dzieła!
        </p>
        <p className={'text--large'}>
          Jeśli chcesz ulepszać spee.ch, dołącz do naszego <a className='link--primary' href='https://chat.lbry.io'>serwera na discordzie</a> albo rozwiąż jakiś <a className='link--primary' href='https://github.com/lbryio/spee.ch/issues'>problem na github</a>.
        </p>
      </Row>
    </div>
  );
};

export default AboutSpeechDetails;
