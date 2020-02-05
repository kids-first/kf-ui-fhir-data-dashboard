import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import ReduxHomepage from './ReduxHomepage';
import ReduxResourceDetails from './ReduxResourceDetails';
import logo from '../img/kf-logo.png';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="app">
          <img src={logo} alt="Kids First" />
          <h1>FHIR Data Dashboard</h1>
          <Switch>
            <Route path="/:resourceType" component={ReduxResourceDetails} />
            <Route path="/" component={ReduxHomepage} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
