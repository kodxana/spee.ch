import React from 'react';
import { LOGIN, CREATE } from '../../constants/publish_channel_select_states';

const ChannelSelectDropdown = ({ selectedChannel, handleSelection, loggedInChannelName }) => {
  return (
    <select
      id='channel-name-select'
      className='select select--arrow'
      value={selectedChannel}
      onChange={handleSelection}>
      { loggedInChannelName && (
        <option value={loggedInChannelName} >{loggedInChannelName}</option>
      )}
      <option value={LOGIN}>Istniejący</option>
      <option value={CREATE}>Nowy</option>
    </select>
  );
};

export default ChannelSelectDropdown;
