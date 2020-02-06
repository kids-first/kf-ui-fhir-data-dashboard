import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import ReduxHomepage from './ReduxHomepage';
import ReduxResourceDetails from './ReduxResourceDetails';
import logo from '../img/d3b-cube.svg';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="app">
          <img src={logo} alt="D3b" />
          <h1>FHIR Data Dashboard</h1>
          <Switch>
            <Route path="/:resourceBaseType" component={ReduxResourceDetails} />
            <Route path="/" component={ReduxHomepage} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
