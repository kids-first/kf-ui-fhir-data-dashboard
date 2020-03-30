import React from 'react';
import PropTypes from 'prop-types';
import {BrowserRouter as Router, Switch, Link} from 'react-router-dom';
import {Button, Icon} from 'semantic-ui-react';
import DecisionRoute from './DecisionRoute';
import ReduxHomepage from './ReduxHomepage';
import ReduxResourceDetails from './ReduxResourceDetails';
import ReduxOntologyHomepage from './ReduxOntologyHomepage';
import ReduxLogin from './ReduxLogin';
import ReduxServerConfiguration from './ReduxServerConfiguration';
import {NO_AUTH, BASIC_AUTH} from '../config';
import logo from '../img/d3b-cube.svg';
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
          <div className="app__header">
            <Link className="app__header-banner" to="/">
              <img src={logo} alt="D3b" />
              <h1>FHIR Data Dashboard</h1>
            </Link>
            {this.isAuthorized() ? (
              <div className="app__header-info">
                {this.authRequired() ? (
                  <div className="app__header-user">
                    <p>Welcome, {this.props.username}</p>
                    <Button onClick={() => this.props.logout()}>Logout</Button>
                  </div>
                ) : null}
                <div className="app__header-nav">
                  <Link to="/">
                    <div className="app__header-nav-item">Resources</div>
                  </Link>
                  <Link to="/ontologies">
                    <div className="app__header-nav-item">Ontologies</div>
                  </Link>
                  <Link to="/settings">
                    <Icon name="setting" size="large" />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
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
              path="/:resourceBaseType"
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
