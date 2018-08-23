import React from 'react';
import PageLayout from '@components/PageLayout';

import PublishTool from '@containers/PublishTool';

class HomePage extends React.Component {
  componentWillUnmount () {
    this.props.clearFile();
  }
  render () {
    return (
      <PageLayout
        pageTitle={'Speech'}
        pageUri={''}
      >
        <PublishTool />
      </PageLayout>
    );
  }
};

export default HomePage;
