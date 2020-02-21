import {connect} from 'react-redux';
import {setUser} from '../actions';
import Login from './Login';

const mapStateToProps = (state, ownProps) => ({});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setUser: (username, password) => dispatch(setUser(username, password)),
  };
};

const ReduxLogin = connect(mapStateToProps, mapDispatchToProps)(Login);
export default ReduxLogin;
