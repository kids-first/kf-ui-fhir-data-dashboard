import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import ReduxAllResources from './ReduxAllResources';
import ResourceDetails from './ResourceDetails';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="app">
          <h1>FHIR Data Dashboard</h1>
          <Switch>
            <Route path="/:resourceType" component={ResourceDetails} />
            <Route path="/" component={ReduxAllResources} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
