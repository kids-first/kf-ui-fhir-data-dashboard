import React from 'react';
import PropTypes from 'prop-types';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import {Container, Segment} from 'semantic-ui-react';
import Header from './Header';
import AppBreadcrumb from './AppBreadcrumb';
import DecisionRoute from './DecisionRoute';
import ReduxHomepage from './ReduxHomepage';
import ReduxResourceDetails from './ReduxResourceDetails';
import ReduxAttributeDetails from './ReduxAttributeDetails';
import ReduxIdDetails from './ReduxIdDetails';
import ReduxOntologyHomepage from './ReduxOntologyHomepage';
import ReduxLogin from './ReduxLogin';
import ReduxServerConfiguration from './ReduxServerConfiguration';
import {NO_AUTH, BASIC_AUTH} from '../config';
import './App.css';

class App extends React.Component {
  isAuthorized = () => {
    if (this.props.selectedServer) {
      switch (this.props.selectedServer.authType) {
        case NO_AUTH:
          return true;
        case BASIC_AUTH:
          return !!this.props.token;
        default:
          return false;
      }
    }
    return false;
  };

  authRequired = () =>
    this.props.selectedServer
      ? this.props.selectedServer.authType !== NO_AUTH
      : false;

  serverSelected = () => !!this.props.selectedServer;

  getRedirectPath = () => {
    if (this.serverSelected() && !this.isAuthorized()) {
      return '/login';
    } else if (this.serverSelected()) {
      return '/resources';
    } else {
      return '/servers';
    }
  };

  render() {
    return (
      <Router basename="/dashboard">
        <div className="app">
          <Header
            isAuthRequired={!!this.authRequired()}
            selectedServer={this.props.selectedServer}
            userIsAuthorized={!!this.isAuthorized()}
            username={this.props.username}
            logout={this.props.logout}
          />
          <Container as={Segment} basic>
            <AppBreadcrumb />
            <Switch>
              <Route path="/servers" component={ReduxServerConfiguration} />
              <DecisionRoute
                path="/login"
                renderComponent={
                  !!this.serverSelected() && !this.isAuthorized()
                }
                component={ReduxLogin}
                redirectPath={this.getRedirectPath()}
              />
              <DecisionRoute
                path="/ontologies/:id"
                renderComponent={
                  !!this.serverSelected() && !!this.isAuthorized()
                }
                component={ReduxIdDetails}
                redirectPath={this.getRedirectPath()}
              />
              <DecisionRoute
                path="/ontologies"
                renderComponent={
                  !!this.serverSelected() && !!this.isAuthorized()
                }
                component={ReduxOntologyHomepage}
                redirectPath={this.getRedirectPath()}
              />
              <DecisionRoute
                path="/resources/:resourceId/id=:id"
                renderComponent={
                  !!this.serverSelected() && !!this.isAuthorized()
                }
                component={ReduxIdDetails}
                redirectPath={this.getRedirectPath()}
              />
              <DecisionRoute
                path="/resources/:resourceId/:query"
                renderComponent={
                  !!this.serverSelected() && !!this.isAuthorized()
                }
                component={ReduxAttributeDetails}
                redirectPath={this.getRedirectPath()}
              />
              <DecisionRoute
                path="/resources/:resourceId"
                renderComponent={
                  !!this.serverSelected() && !!this.isAuthorized()
                }
                component={ReduxResourceDetails}
                redirectPath={this.getRedirectPath()}
              />
              <DecisionRoute
                path="/resources"
                renderComponent={
                  !!this.serverSelected() && !!this.isAuthorized()
                }
                component={ReduxHomepage}
                redirectPath={this.getRedirectPath()}
              />
              <DecisionRoute
                path="/"
                renderComponent={false}
                component={null}
                redirectPath={this.getRedirectPath()}
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
  selectedServer: PropTypes.object,
  token: PropTypes.string,
  username: PropTypes.string,
  logout: PropTypes.func.isRequired,
};

App.defaultProps = {
  token: null,
  username: null,
};

export default App;
