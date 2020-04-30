import React from 'react';
import PropTypes from 'prop-types';
import {BrowserRouter as Router, Switch} from 'react-router-dom';
import {Container, Segment} from 'semantic-ui-react';
import Header from './Header';
import DecisionRoute from './DecisionRoute';
import ReduxHomepage from './ReduxHomepage';
import ReduxResourceDetails from './ReduxResourceDetails';
import ReduxOntologyHomepage from './ReduxOntologyHomepage';
import ReduxLogin from './ReduxLogin';
import ReduxServerConfiguration from './ReduxServerConfiguration';
import {NO_AUTH, BASIC_AUTH} from '../config';
import './App.css';

class App extends React.Component {
  isAuthorized = () => {
    switch (this.props.selectedServer.authType) {
      case NO_AUTH:
        return true;
      case BASIC_AUTH:
        return !!this.props.token;
      default:
        return true;
    }
  };

  authRequired = () => this.props.selectedServer.authType !== NO_AUTH;

  render() {
    return (
      <Router>
        <div className="app">
          <Header
            isAuthRequired={!!this.authRequired()}
            selectedServer={this.props.selectedServer}
            userIsAuthorized={!!this.isAuthorized()}
            username={this.props.username}
            logout={this.props.logout}
          />
          <Container as={Segment} basic>
            <Switch>
              <DecisionRoute
                path="/login"
                renderComponent={!this.isAuthorized()}
                component={ReduxLogin}
                redirectPath="/"
              />
              <DecisionRoute
                path="/ontologies"
                renderComponent={!!this.isAuthorized()}
                component={ReduxOntologyHomepage}
                redirectPath="/login"
              />
              <DecisionRoute
                path="/settings"
                renderComponent={!!this.isAuthorized()}
                component={ReduxServerConfiguration}
                redirectPath="/login"
              />
              <DecisionRoute
                path="/:resourceId"
                renderComponent={!!this.isAuthorized()}
                component={ReduxResourceDetails}
                redirectPath="/login"
              />
              <DecisionRoute
                path="/"
                renderComponent={!!this.isAuthorized()}
                component={ReduxHomepage}
                redirectPath="/login"
              />
            </Switch>
          </Container>
        </div>
      </Router>
    );
  }
}

App.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  selectedServer: PropTypes.object.isRequired,
  token: PropTypes.string,
  username: PropTypes.string,
  logout: PropTypes.func.isRequired,
};

App.defaultProps = {
  token: null,
  username: null,
};

export default App;
