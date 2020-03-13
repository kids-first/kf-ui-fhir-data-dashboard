import {connect} from 'react-redux';
import {clearUser, addServer} from '../actions';
import App from './App';

const mapStateToProps = (state, ownProps) => ({
  token: state.user ? state.user.token : null,
  username: state.user ? state.user.username : null,
  baseUrl: state.resources ? state.resources.baseUrl : '',
  serverOptions: state.user ? state.user.serverOptions : [],
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    logout: () => dispatch(clearUser()),
    addServer: url => dispatch(addServer(url)),
  };
};

const ReduxApp = connect(mapStateToProps, mapDispatchToProps)(App);
export default ReduxApp;
