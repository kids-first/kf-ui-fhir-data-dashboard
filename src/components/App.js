import React from 'react';
import PropTypes from 'prop-types';
import {BrowserRouter as Router, Switch, Link} from 'react-router-dom';
import DecisionRoute from './DecisionRoute';
import ReduxHomepage from './ReduxHomepage';
import ReduxResourceDetails from './ReduxResourceDetails';
import ReduxOntologyHomepage from './ReduxOntologyHomepage';
import ReduxLogin from './ReduxLogin';
import logo from '../img/d3b-cube.svg';
import './App.css';

class App extends React.Component {
  render() {
    const authorized = !!this.props.token;
    console.log('authorized?', authorized);
    return (
      <Router>
        <div className="app">
          <div className="app__header">
            <Link className="app__header-banner" to="/">
              <img src={logo} alt="D3b" />
              <h1>FHIR Data Dashboard</h1>
            </Link>
            <div className="app__header-nav">
              <Link to="/">
                <div className="app__header-nav-item">Resources</div>
              </Link>
              <Link to="/ontologies">
                <div className="app__header-nav-item">Ontologies</div>
              </Link>
            </div>
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
  token: PropTypes.string,
};

App.defaultProps = {
  token: null,
};

export default App;
