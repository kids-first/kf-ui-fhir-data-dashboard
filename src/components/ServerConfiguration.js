import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  Modal,
  Input,
  Button,
  Dropdown,
  Label,
  Form,
} from 'semantic-ui-react';
import {NO_AUTH, BASIC_AUTH} from '../config';
import SortableTable from './tables/SortableTable';
import './ServerConfiguration.css';

class ServerConfiguration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedServerOption: null,
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

  setApi = () => {
    this.props.setApi(this.state.selectedServerOption.url);
  };

  render() {
    const authOptions = [
      {key: NO_AUTH, text: 'None', value: NO_AUTH},
      {key: BASIC_AUTH, text: 'Basic', value: BASIC_AUTH},
    ];

    const tableHeaders = [
      {display: 'Name', sortId: 'name', sort: true},
      {display: 'URL', sortId: 'url', sort: true},
      {display: 'Auth Type', sortId: 'authType', sort: true},
      {display: '', sortId: 'action', sort: false},
    ];

    const serverOptions = this.props.serverOptions.map(server => ({
      ...server,
      action: <Button onClick={() => this.editServer(server)}>Edit</Button>,
    }));

    const selectedServer = this.getSelectedServer();

    return (
      <div className="server-configuration">
        <h2>Servers</h2>
        <Button onClick={() => this.addNewServer()}>
          <Icon name="plus" />
          Add a new server
        </Button>
        <div className="server-configuration__options">
          <SortableTable
            headerCells={tableHeaders}
            data={serverOptions}
            onRowClick={server => this.setState({selectedServerOption: server})}
          />
        </div>
        {this.state.selectedServerOption ? (
          <Button onClick={() => this.setApi()}>
            Launch {this.state.selectedServerOption.name}
          </Button>
        ) : null}
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
                <Form
                  onSubmit={() =>
                    selectedServer.exists
                      ? this.updateServer()
                      : this.submitServer()
                  }
                >
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
                  <Button type="submit">Save</Button>
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
  setApi: PropTypes.func.isRequired,
};

ServerConfiguration.defaultProps = {
  serverOptions: [],
};

export default ServerConfiguration;
