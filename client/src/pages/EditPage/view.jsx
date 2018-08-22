import React from 'react';
import PageLayout from '@components/PageLayout';

import PublishTool from '@containers/PublishTool';

class EditPage extends React.Component {
  componentDidMount () {
    const {asset, match, onHandleShowPageUri, setUpdateTrue, updateMetadata} = this.props;
    onHandleShowPageUri(match.params);
    setUpdateTrue();
    console.log("EditPade did mount asset:", asset);
    if (asset) {
      console.log("title:", asset.claimData.title);
      // updateMetadata({ name: 'title', value: asset.claimData.title });
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
