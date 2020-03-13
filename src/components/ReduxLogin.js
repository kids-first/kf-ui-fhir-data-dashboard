import {connect} from 'react-redux';
import {userIsAuthorized} from '../utils/api';
import {setUser} from '../actions';
import Login from './Login';

const mapStateToProps = (state, ownProps) => ({
  baseUrl: state.resources.baseUrl,
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    checkUser: async (username, password, url, abortController) =>
      await userIsAuthorized(username, password, url, abortController)
        .then(result => result)
        .catch(err => {
          throw err;
        }),
    setUser: (username, password) => dispatch(setUser(username, password)),
  };
};

const ReduxLogin = connect(mapStateToProps, mapDispatchToProps)(Login);
export default ReduxLogin;
