import React from 'react';
import PageLayout from '@components/PageLayout';

import PublishTool from '@containers/PublishTool';

class HomePage extends React.Component {
  componentDidMount() {
    console.log("home page did mount");
  }
  componentWillUnmount () {
    console.log("home page unmount");
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
