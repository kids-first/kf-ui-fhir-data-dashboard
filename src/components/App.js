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
import logo from '../img/d3b-cube.svg';
import './App.css';

class App extends React.Component {
  render() {
    const serverConfig = this.props.serverOptions.find(
      x => x.url === this.props.baseUrl,
    );
    const authorized =
      serverConfig && serverConfig.authRequired ? !!this.props.token : true;

    return (
      <Router>
        <div className="app">
          <div className="app__header">
            <Link className="app__header-banner" to="/">
              <img src={logo} alt="D3b" />
              <h1>FHIR Data Dashboard</h1>
            </Link>
            {authorized ? (
              <div className="app__header-info">
                <div className="app__header-user">
                  {serverConfig && serverConfig.authRequired ? (
                    <React.Fragment>
                      <p>Welcome, {this.props.username}</p>
                      <Button onClick={() => this.props.logout()}>
                        Logout
                      </Button>
                    </React.Fragment>
                  ) : null}
                </div>
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
              renderComponent={!authorized}
              component={ReduxLogin}
              redirectPath="/"
            />
            <DecisionRoute
              path="/ontologies"
              renderComponent={!!authorized}
              component={ReduxOntologyHomepage}
              redirectPath="/login"
            />
            <DecisionRoute
              path="/settings"
              renderComponent={!!authorized}
              component={ReduxServerConfiguration}
              redirectPath="/login"
            />
            <DecisionRoute
              path="/:resourceBaseType"
              renderComponent={!!authorized}
              component={ReduxResourceDetails}
              redirectPath="/login"
            />
            <DecisionRoute
              path="/"
              renderComponent={!!authorized}
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
  token: PropTypes.string,
  username: PropTypes.string,
  logout: PropTypes.func.isRequired,
  serverOptions: PropTypes.array,
};

App.defaultProps = {
  token: null,
  username: null,
  serverOptions: [],
};

export default App;
