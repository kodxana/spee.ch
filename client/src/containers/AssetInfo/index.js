import { connect } from 'react-redux';
import View from './view';
import { selectAsset } from '../../selectors/show';

const mapStateToProps = (props) => {
  const {show} = props;
  let channelShortId = show.request.id.split('#')[4];
  if (channelShortId === 'null') channelShortId = null;
  // select asset
  const asset = selectAsset(show);
  //  return props
  return {
    asset,
    channelShortId,
  };
};

export default connect(mapStateToProps, null)(View);
