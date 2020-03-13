import React from 'react';
import PropTypes from 'prop-types';
import {Input, Button} from 'semantic-ui-react';
import './Login.css';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null,
      showAuthError: true,
      authError: null,
      checkingUser: false,
    };
  }

  handleUsernameChange = e => {
    this.setState({username: e.target.value});
  };

  handlePasswordChange = e => {
    this.setState({password: e.target.value});
  };

  login = async e => {
    e.preventDefault();
    this.setState({authError: null, checkingUser: true}, async () => {
      await this.props
        .checkUser(this.state.username, this.state.password, this.props.baseUrl)
        .then(({isAuthorized, error}) => {
          this.setState({checkingUser: false});
          if (isAuthorized) {
            this.props.setUser(this.state.username, this.state.password);
          } else {
            this.setState({authError: error});
          }
        });
    });
  };

  render() {
    return (
      <div className="login">
        <div className="login__content">
          <h2>Login</h2>
          <form onSubmit={this.login}>
            <Input
              placeholder="Enter your username"
              onChange={this.handleUsernameChange}
              autoComplete="username"
            />
            <Input
              type="password"
              placeholder="Enter your password"
              onChange={this.handlePasswordChange}
              autoComplete="current-password"
            />
            <Button type="submit">Login</Button>
          </form>
          {this.state.authError ? (
            <div className="login__auth-error">
              <p>There was an error logging in:</p>
              <pre>
                {this.state.authError.statusText}: {this.state.authError.status}
              </pre>
            </div>
          ) : null}
          <div
            className={`ui ${
              this.state.checkingUser ? 'active' : 'disabled'
            } loader`}
          />
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  setUser: PropTypes.func.isRequired,
  baseUrl: PropTypes.string.isRequired,
  checkUser: PropTypes.func.isRequired,
};

export default Login;
