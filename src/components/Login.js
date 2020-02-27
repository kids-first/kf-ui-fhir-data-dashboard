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
    };
  }

  handleUsernameChange = e => {
    this.setState({username: e.target.value});
  };

  handlePasswordChange = e => {
    this.setState({password: e.target.value});
  };

  login = e => {
    e.preventDefault();
    this.props.setUser(this.state.username, this.state.password);
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
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default Login;
