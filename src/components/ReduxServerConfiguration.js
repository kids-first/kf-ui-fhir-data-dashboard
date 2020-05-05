import {connect} from 'react-redux';
import {addServer, updateServer, setApi} from '../actions';
import ServerConfiguration from './ServerConfiguration';

const mapStateToProps = (state, ownProps) => ({
  serverOptions: state.app ? state.app.serverOptions : [],
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addServer: (id, name, url, authType) =>
      dispatch(addServer(id, name, url, authType)),
    updateServer: (id, name, url, authType) =>
      dispatch(updateServer(id, name, url, authType)),
    setApi: url => {
      console.log('url', url);
      dispatch(setApi(url));
    },
  };
};

const ReduxServerConfiguration = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ServerConfiguration);
export default ReduxServerConfiguration;
