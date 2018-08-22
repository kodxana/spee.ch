import React from 'react';
import Dropzone from '@containers/Dropzone';
import PublishPreview from '@components/PublishPreview';
import PublishStatus from '@containers/PublishStatus';
import PublishDisabledMessage from '@containers/PublishDisabledMessage';

class PublishTool extends React.Component {
  render () {
    const {disabled, file, update, status} = this.props;
    if (disabled) {
      return (
        <PublishDisabledMessage />
      );
    } else {
      if (file || update) {
        if (status) {
          return (
            <PublishStatus />
          );
        } else {
          return <PublishPreview update={update} />;
        }
      }
      return <Dropzone />;
    }
  }
};

export default PublishTool;
