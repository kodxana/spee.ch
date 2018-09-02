import React from 'react';
import Label from '@components/Label';
import RowLabeled from '@components/RowLabeled';

const ChannelCreateNameInput  = ({ value, error, handleNameInput }) => {
  return (
    <RowLabeled
      label={
        <Label value={'Name:'} />
      }
      content={
        <div className='input-area'>
          <span>@</span>
          <input
            type='text'
            name='channel'
            className='input-text'
            placeholder='przykładowaNazwaKanału'
            value={value}
            onChange={handleNameInput}
          />
          { (value && !error) && (
            <span className='info-message--success span--absolute'>
              {'\u2713'}
            </span>
          )}
          { error && (
            <span className='info-message--failure span--absolute'>
              {'\u2716'}
            </span>
          )}
        </div>
      }
    />
  );
};

export default ChannelCreateNameInput;
