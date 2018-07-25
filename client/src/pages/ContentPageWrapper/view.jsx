import React from 'react';
import ErrorPage from '@pages/ErrorPage';
import ShowAsset from '@pages/ShowAsset';
import ShowChannel from '@pages/ShowChannel';

import { CHANNEL, ASSET } from '../../constants/show_request_types';

class ContentPageWrapper extends React.Component {
  componentDidMount () {
    this.props.onHandleShowPageUri(this.props.match.params);
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.match.params !== this.props.match.params) {
      this.props.onHandleShowPageUri(nextProps.match.params);
    }
  }
  render () {
    const { error, requestType } = this.props;
    if (error) {
      return (
        <ErrorPage error={error} />
      );
    }
    switch (requestType) {
      case CHANNEL:
        return <ShowChannel />;
      case ASSET:
        return <ShowAsset />;
      default:
        return <p>loading...</p>;
    }
  }
};

export default ContentPageWrapper;
