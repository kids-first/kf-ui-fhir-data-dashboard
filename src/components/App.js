import React from 'react';
import PropTypes from 'prop-types';
import {BrowserRouter as Router, Switch, Link} from 'react-router-dom';
import {Button} from 'semantic-ui-react';
import DecisionRoute from './DecisionRoute';
import ReduxHomepage from './ReduxHomepage';
import ReduxResourceDetails from './ReduxResourceDetails';
import ReduxOntologyHomepage from './ReduxOntologyHomepage';
import ReduxLogin from './ReduxLogin';
import logo from '../img/d3b-cube.svg';
import './App.css';

class App extends React.Component {
  render() {
    const serverConfig = this.props.serverOptions.find(
      x => x.url === this.props.baseUrl,
    );
    if (!serverConfig) {
      this.props.addServer(this.props.baseUrl);
    }
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
                {serverConfig && serverConfig.authRequired ? (
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
  addServer: PropTypes.func.isRequired,
};

App.defaultProps = {
  token: null,
  username: null,
  serverOptions: [],
};

export default App;
