import React from 'react';
import Label from '@components/Label';
import RowLabeled from '@components/RowLabeled';

const ChannelCreatePasswordInput  = ({ value, handlePasswordInput }) => {
  return (
    <RowLabeled
      label={
        <Label value={'Hasło:'} />
      }
      content={
        <div className='input-area'>
          <input
            type='password'
            name='password'
            className='input-text'
            placeholder=''
            value={value}
            onChange={handlePasswordInput} />
        </div>
      }
    />
  );
};

export default ChannelCreatePasswordInput;
