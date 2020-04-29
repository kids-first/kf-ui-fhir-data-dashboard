import React from 'react';
import PropTypes from 'prop-types';
import {BrowserRouter as Router, Switch, Link} from 'react-router-dom';
import {Icon, Container, Menu, Segment, Image} from 'semantic-ui-react';
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
          <Menu>
            <Container>
              <Menu.Item>
                <Link to="/">
                  <Image src={logo} alt="D3b" size="mini" />
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link to="/">FHIR Data Dashboard</Link>
              </Menu.Item>
              {this.isAuthorized() ? (
                <React.Fragment>
                  <Menu.Item>
                    <Link to="/">Resources</Link>
                  </Menu.Item>
                  <Menu.Item>
                    <Link to="/ontologies">Ontologies</Link>
                  </Menu.Item>

                  <Menu.Menu position="right">
                    <Menu.Item>
                      <Link to="/settings">
                        Server
                        <Icon name="chevron down" size="small" />
                      </Link>
                    </Menu.Item>
                    {this.authRequired() ? (
                      <Menu.Item>
                        <Link to="/user">
                          <Icon name="user circle" size="big" />
                          <Icon name="chevron down" size="small" />
                        </Link>
                      </Menu.Item>
                    ) : null}
                  </Menu.Menu>
                </React.Fragment>
              ) : null}
            </Container>
          </Menu>
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
