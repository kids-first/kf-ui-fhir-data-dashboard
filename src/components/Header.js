import React from 'react';
import PropTypes from 'prop-types';
import {Menu, Container, Image, Dropdown} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import logo from '../img/d3b-cube.svg';
import './Header.css';

class Header extends React.Component {
  render() {
    const {
      userIsAuthorized,
      isAuthRequired,
      selectedServer,
      username,
      logout,
    } = this.props;
    return (
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
          {userIsAuthorized ? (
            <React.Fragment>
              <Menu.Item>
                <Link to="/">Resources</Link>
              </Menu.Item>
              <Menu.Item>
                <Link to="/ontologies">Ontologies</Link>
              </Menu.Item>
              <Menu.Menu position="right">
                <Dropdown item text="Server">
                  <Dropdown.Menu>
                    <Dropdown.Header>{selectedServer.name}</Dropdown.Header>
                    <Dropdown.Header>{selectedServer.url}</Dropdown.Header>
                    <Dropdown.Item>Switch servers</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                {isAuthRequired ? (
                  <Dropdown item text="User">
                    <Dropdown.Menu>
                      <Dropdown.Header>
                        <p>{username}</p>
                      </Dropdown.Header>
                      <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : null}
              </Menu.Menu>
            </React.Fragment>
          ) : null}
        </Container>
      </Menu>
    );
  }
}

export default Header;

Header.propTypes = {
  userIsAuthorized: PropTypes.bool,
  selectedServer: PropTypes.object.isRequired,
  isAuthRequired: PropTypes.bool,
  logout: PropTypes.func.isRequired,
};

Header.defaultProps = {
  userIsAuthorized: false,
  isAuthRequired: true,
};
