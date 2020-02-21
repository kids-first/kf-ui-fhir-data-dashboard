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

  login = () => {
    this.props.setUser(this.state.username, this.state.password);
  };

  render() {
    console.log('this.state', this.state);
    return (
      <div className="login">
        <h2>Login</h2>
        <Input
          placeholder="Enter your username"
          onBlur={this.handleUsernameChange}
        />
        <Input
          placeholder="Enter your password"
          onBlur={this.handlePasswordChange}
        />
        <Button onClick={() => this.login()}>Login</Button>
      </div>
    );
  }
}

Login.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default Login;
