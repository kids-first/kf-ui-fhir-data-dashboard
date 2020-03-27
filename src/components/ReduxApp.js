import {connect} from 'react-redux';
import {clearUser} from '../actions';
import App from './App';

const mapStateToProps = (state, ownProps) => ({
  token: state.app ? state.app.token : null,
  username: state.app ? state.app.username : null,
  baseUrl: state.resources ? state.resources.baseUrl : '',
  serverOptions: state.app ? state.app.serverOptions : [],
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    logout: () => dispatch(clearUser()),
  };
};

const ReduxApp = connect(mapStateToProps, mapDispatchToProps)(App);
export default ReduxApp;
