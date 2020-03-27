import React from 'react';
import PropTypes from 'prop-types';
import {Card, Icon, Modal, Input, Radio, Button} from 'semantic-ui-react';
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
        authRequired: false,
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

  onAuthChange = option => {
    if (option) {
      let serverOption = {...this.state.editServerOption};
      serverOption.authRequired = !this.state.editServerOption.authRequired;
      this.setState({editServerOption: serverOption});
    } else {
      let server = this.state.newServer;
      server.authRequired = !this.state.newServer.authRequired;
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
        authRequired: false,
      },
    });
  };

  addNewServer = () => {
    this.setState({
      createMode: true,
    });
  };

  submitServer = () => {
    const {name, url, authRequired} = this.state.newServer;
    this.props.addServer(
      this.props.serverOptions.length,
      name,
      url,
      authRequired,
    );
    this.closeModal();
  };

  updateServer = () => {
    const {id, name, url, authRequired} = this.state.editServerOption;
    this.props.updateServer(id, name, url, authRequired);
    this.closeModal();
  };

  render() {
    return (
      <div className="server-configuration">
        <h2>Servers</h2>
        <Button onClick={() => this.addNewServer()}>
          <Icon name="plus" />
          Add a new server
        </Button>
        <div className="server-configuration__options">
          {this.props.serverOptions.map(option => (
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
                    <b>Requires auth?</b>{' '}
                    {option.authRequired ? (
                      <Icon name="check" color="green" />
                    ) : (
                      <Icon name="ban" color="red" />
                    )}
                  </p>
                </Card.Description>
              </Card.Content>
            </Card>
          ))}
        </div>
        <Modal
          open={this.state.editMode || this.state.createMode}
          onClose={() => this.closeModal()}
          dimmer="inverted"
        >
          <Modal.Header>
            {this.state.editMode ? 'Edit Server Config' : 'Add New Server'}
          </Modal.Header>
          <Modal.Content>
            <div className="server-configuration__modal">
              {this.state.editMode && this.state.editServerOption ? (
                <React.Fragment>
                  <Input
                    label="Name:"
                    value={this.state.editServerOption.name}
                    onChange={e =>
                      this.onNameChange(e, this.state.editServerOption)
                    }
                  />
                  <Input
                    label="URL:"
                    value={this.state.editServerOption.url}
                    onChange={e =>
                      this.onURLChange(e, this.state.editServerOption)
                    }
                  />
                  <Radio
                    toggle
                    label="Requires auth?"
                    checked={this.state.editServerOption.authRequired}
                    onChange={() =>
                      this.onAuthChange(this.state.editServerOption)
                    }
                  />
                  <Button onClick={() => this.updateServer()}>Save</Button>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Input
                    label="Name:"
                    value={this.state.newServer.name}
                    onChange={e => this.onNameChange(e)}
                  />
                  <Input
                    label="URL:"
                    value={this.state.newServer.url}
                    onChange={e => this.onURLChange(e)}
                  />
                  <Radio
                    toggle
                    label="Requires auth?"
                    checked={this.state.newServer.authRequired}
                    onChange={() => this.onAuthChange()}
                  />
                  <Button onClick={() => this.submitServer()}>Add</Button>
                </React.Fragment>
              )}
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
      authRequired: PropTypes.bool.isRequired,
    }),
  ),
  addServer: PropTypes.func.isRequired,
  updateServer: PropTypes.func.isRequired,
};

ServerConfiguration.defaultProps = {
  serverOptions: [],
};

export default ServerConfiguration;
