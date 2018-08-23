import { connect } from 'react-redux';
import { setUpdateTrue, updateMetadata } from '../../actions/publish';
import { onHandleShowPageUri } from '../../actions/show';
import View from './view';

const mapStateToProps = (props) => {
  const {show} = props;
  // select request info
  const requestId = show.request.id;
  // select asset info
  let asset;
  const request = show.requestList[requestId] || null;
  const assetList = show.assetList;
  if (request && assetList) {
    const assetKey = request.key;  // note: just store this in the request
    asset = assetList[assetKey] || null;
  };
  return {
    asset,
  };
};

const mapDispatchToProps = dispatch => ({
  updateMetadata     : (name, value) => dispatch(updateMetadata(name, value)),
  onHandleShowPageUri: (params) => dispatch(onHandleShowPageUri(params)),
  setUpdateTrue      : () => dispatch(setUpdateTrue()),
});

export default connect(mapStateToProps, mapDispatchToProps)(View);
