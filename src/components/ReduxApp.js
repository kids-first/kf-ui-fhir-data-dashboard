import {connect} from 'react-redux';
import {clearUser} from '../actions';
import App from './App';

const mapStateToProps = (state, ownProps) => ({
  token: state.app ? state.app.token : null,
  username: state.app ? state.app.username : null,
  baseUrl:
    state.app && state.app.selectedServer ? state.app.selectedServer.url : '',
  selectedServer: state.app ? state.app.selectedServer : {},
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    logout: () => dispatch(clearUser()),
  };
};

const ReduxApp = connect(mapStateToProps, mapDispatchToProps)(App);
export default ReduxApp;
