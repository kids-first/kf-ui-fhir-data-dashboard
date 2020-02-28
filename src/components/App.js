import React from 'react';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
import ReduxHomepage from './ReduxHomepage';
import ReduxResourceDetails from './ReduxResourceDetails';
import ReduxOntologyHomepage from './ReduxOntologyHomepage';
import logo from '../img/d3b-cube.svg';
import './App.css';

class App extends React.Component {
  render() {
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
            <Route path="/ontologies" component={ReduxOntologyHomepage} />
            <Route path="/:resourceBaseType" component={ReduxResourceDetails} />
            <Route path="/" component={ReduxHomepage} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
