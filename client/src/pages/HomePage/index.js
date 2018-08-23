import { connect } from 'react-redux';
import { clearFile } from '../../actions/publish';
import View from './view';

const mapDispatchToProps = {
  clearFile,
};

export default connect(null, mapDispatchToProps)(View);
