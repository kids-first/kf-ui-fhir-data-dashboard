import {connect} from 'react-redux';
import {clearUser} from '../actions';
import App from './App';

const mapStateToProps = (state, ownProps) => ({
  token: state.user ? state.user.token : null,
  username: state.user ? state.user.username : null,
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    logout: () => dispatch(clearUser()),
  };
};

const ReduxApp = connect(mapStateToProps, mapDispatchToProps)(App);
export default ReduxApp;
