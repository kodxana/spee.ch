import { connect } from 'react-redux';
import { clearFile, startPublish } from '../../actions/publish';
import View from './view';

const mapStateToProps = (props) => {
  return {
    file  : props.publish.file,
    update: props.publish.isUpdate,
  };
};

const mapDispatchToProps = {
  clearFile,
  startPublish,
};

export default connect(mapStateToProps, mapDispatchToProps)(View);
