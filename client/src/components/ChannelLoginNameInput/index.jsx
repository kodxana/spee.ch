import React from 'react';
import RowLabeled from '@components/RowLabeled';
import Label from '@components/Label';

const ChannelLoginNameInput  = ({ channelName, handleInput }) => {
  return (
    <RowLabeled
      label={
        <Label value={'Nazwa:'} />
      }
      content={
        <div className='input-area'>
          <span>@</span>
          <input
            type='text'
            id='channel-login-name-input'
            className='input-text'
            name='name'
            placeholder='Nazwa Twojego Kanału'
            value={channelName}
            onChange={handleInput}
          />
        </div>
      }
    />
  );
};

export default ChannelLoginNameInput;
