import {connect} from 'react-redux';
import App from './App';

const mapStateToProps = (state, ownProps) => ({
  token: state.user ? state.user.token : null,
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

const ReduxApp = connect(mapStateToProps, mapDispatchToProps)(App);
export default ReduxApp;
