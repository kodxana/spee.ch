import { connect } from 'react-redux';
import View from './view';
import { selectAsset } from '../../selectors/show';

const mapStateToProps = (props) => {
  const { claimData: { title } } = selectAsset(props.show);
  const requestId = props.show.request.id;
  const channelName = props.channel.loggedInChannel.name;
  const {shortId} = props.channel.loggedInChannel;
  const editable = channelName && requestId && requestId.split('#')[3] === channelName;
  return {
    title,
    editable,
    channel: editable ? channelName : undefined,
    name   : editable ? requestId.split('#')[1] : undefined,
    shortId,
  };
};

export default connect(mapStateToProps, null)(View);
