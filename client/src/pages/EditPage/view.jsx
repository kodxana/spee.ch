import React from 'react';
import PageLayout from '@components/PageLayout';

import PublishTool from '@containers/PublishTool';

class EditPage extends React.Component {
  componentDidMount () {
    const {asset, match, onHandleShowPageUri, setUpdateTrue, updateMetadata} = this.props;
    onHandleShowPageUri(match.params);
    setUpdateTrue();
    if (asset) {
      ['title', 'description', 'license', 'nsfw'].forEach(meta => updateMetadata(meta, asset.claimData[meta]));
    }
  }
  render () {
    return (
      <PageLayout
        pageTitle={'Edit claim'}
        pageUri={'edit'}
      >
        <PublishTool />
      </PageLayout>
    );
  }
};

export default EditPage;
