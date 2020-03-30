import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Icon,
  Modal,
  Input,
  Button,
  Dropdown,
  Label,
  Form,
} from 'semantic-ui-react';
import {NO_AUTH, BASIC_AUTH} from '../config';
import './ServerConfiguration.css';

class ServerConfiguration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      editServerOption: null,
      createMode: false,
      newServer: {
        name: '',
        url: '',
        authType: NO_AUTH,
      },
    };
  }

  editServer = option => {
    this.setState({editMode: true, editServerOption: option});
  };

  onNameChange = (e, option) => {
    if (option) {
      let serverOption = {...this.state.editServerOption};
      serverOption.name = e.target.value;
      this.setState({editServerOption: serverOption});
    } else {
      let server = this.state.newServer;
      server.name = e.target.value;
      this.setState({newServer: server});
    }
  };

  onURLChange = (e, option) => {
    if (option) {
      let serverOption = {...this.state.editServerOption};
      serverOption.url = e.target.value;
      this.setState({editServerOption: serverOption});
    } else {
      let server = this.state.newServer;
      server.url = e.target.value;
      this.setState({newServer: server});
    }
  };

  onAuthTypeChange = (e, option) => {
    if (option) {
      let serverOption = {...this.state.editServerOption};
      serverOption.authType = e;
      this.setState({editServerOption: serverOption});
    } else {
      let server = this.state.newServer;
      server.authType = e;
      this.setState({newServer: server});
    }
  };

  closeModal = () => {
    this.setState({
      editMode: false,
      createMode: false,
      editServerOption: null,
      newServer: {
        name: '',
        url: '',
        authType: NO_AUTH,
      },
    });
  };

  addNewServer = () => {
    this.setState({
      createMode: true,
    });
  };

  submitServer = () => {
    const {name, url, authType} = this.state.newServer;
    this.props.addServer(this.props.serverOptions.length, name, url, authType);
    this.closeModal();
  };

  updateServer = () => {
    const {id, name, url, authType} = this.state.editServerOption;
    this.props.updateServer(id, name, url, authType);
    this.closeModal();
  };

  getSelectedServer = () => {
    if (this.state.editMode) {
      return {
        ...this.state.editServerOption,
        exists: true,
      };
    } else if (this.state.createMode) {
      return {
        ...this.state.newServer,
        exists: false,
      };
    } else return null;
  };

  render() {
    const authOptions = [
      {key: NO_AUTH, text: 'None', value: NO_AUTH},
      {key: BASIC_AUTH, text: 'Basic', value: BASIC_AUTH},
    ];

    const selectedServer = this.getSelectedServer();

    return (
      <div className="server-configuration">
        <h2>Servers</h2>
        <Button onClick={() => this.addNewServer()}>
          <Icon name="plus" />
          Add a new server
        </Button>
        <div className="server-configuration__options">
          {this.props.serverOptions.map(option => {
            return (
              <Card key={option.id}>
                <Card.Content>
                  <Card.Header>
                    {option.name}
                    <Icon
                      name="pencil"
                      size="small"
                      onClick={() => this.editServer(option)}
                    />
                  </Card.Header>
                  <Card.Description>
                    <p>
                      <b>URL:</b> {option.url}
                    </p>
                    <p>
                      <b>AuthN/AuthZ method:</b>{' '}
                      {
                        authOptions.find(elt => elt.value === option.authType)
                          .text
                      }
                    </p>
                  </Card.Description>
                </Card.Content>
              </Card>
            );
          })}
        </div>
        <Modal
          open={!!selectedServer}
          onClose={() => this.closeModal()}
          dimmer="inverted"
        >
          <Modal.Header>
            {this.state.editMode ? 'Edit Server Config' : 'Add New Server'}
          </Modal.Header>
          <Modal.Content>
            <div className="server-configuration__modal">
              {!!selectedServer ? (
                <Form>
                  <Input
                    label="Name:"
                    value={selectedServer.name}
                    onChange={e => this.onNameChange(e, selectedServer.exists)}
                  />
                  <Input
                    label="URL:"
                    value={selectedServer.url}
                    onChange={e => this.onURLChange(e, selectedServer.exists)}
                  />
                  <div className="ui labeled input">
                    <Label>Auth Type:</Label>
                    <Dropdown
                      defaultValue={selectedServer.authType}
                      selection
                      options={authOptions}
                      onChange={(e, {value}) =>
                        this.onAuthTypeChange(value, selectedServer.exists)
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    onClick={() =>
                      selectedServer.exists
                        ? this.updateServer()
                        : this.submitServer()
                    }
                  >
                    Save
                  </Button>
                </Form>
              ) : null}
            </div>
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

ServerConfiguration.propTypes = {
  serverOptions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      authType: PropTypes.string.isRequired,
    }),
  ),
  addServer: PropTypes.func.isRequired,
  updateServer: PropTypes.func.isRequired,
};

ServerConfiguration.defaultProps = {
  serverOptions: [],
};

export default ServerConfiguration;
