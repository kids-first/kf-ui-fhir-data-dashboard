import {connect} from 'react-redux';
import {userIsAuthorized} from '../utils/api';
import {setUser} from '../actions';
import Login from './Login';

const mapStateToProps = (state, ownProps) => ({
  baseUrl: state.resources.baseUrl,
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    checkUser: async (username, password, url) =>
      await userIsAuthorized(username, password, url).then(result => result),
    setUser: (username, password) => dispatch(setUser(username, password)),
  };
};

const ReduxLogin = connect(mapStateToProps, mapDispatchToProps)(Login);
export default ReduxLogin;
