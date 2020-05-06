import React from 'react';
import PropTypes from 'prop-types';
import {Loader, Tab} from 'semantic-ui-react';
import ReactJson from 'react-json-view';
import {logErrors} from '../utils/common';
import ReferenceTable from './tables/ReferenceTable';
import './IdDetails.css';

class IdDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      payload: {},
      abortController: new AbortController(),
    };
  }

  componentDidMount() {
    this.getDetails();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.getDetails();
    }
  }

  getDetails = () => {
    const {
      fetchResource,
      setLoadingMessage,
      resourceId,
      id,
      schemaUrl,
      baseUrl,
    } = this.props;
    this.setState({loading: true}, () => {
      setLoadingMessage(`Fetching information for ${id}...`);
      fetchResource(`${schemaUrl}/${resourceId}`, this.state.abortController)
        .then(data => {
          const type = data.type;
          fetchResource(`${baseUrl}${type}/${id}`, this.state.abortController)
            .then(data => {
              this.setState({payload: data, loading: false});
            })
            .catch(err => logErrors(`Error getting payload for ${id}:`, err));
        })
        .catch(err =>
          logErrors(`Error getting schema for ${resourceId}:`, err),
        );
    });
  };

  render() {
    const {id} = this.props;
    const {payload} = this.state;
    console.log('payload', payload);
    const tableHeaders = [
      {display: 'Resource Type', sortId: 'resourceType'},
      {display: 'Resource Name', sortId: 'name'},
      {display: 'Profile', sortId: 'profile'},
      {display: 'Total References', sortId: 'total'},
    ];
    const panes = [
      {
        menuItem: 'Payload',
        render: () => (
          <Tab.Pane>
            <ReactJson src={payload} />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'References',
        render: () => (
          <Tab.Pane>
            <ReferenceTable
              resource={payload}
              tableHeaders={tableHeaders}
              baseUrl={this.props.baseUrl}
              setLoadingMessage={this.props.setLoadingMessage}
              loadingMessage={this.props.loadingMessage}
              history={this.props.history}
            />
          </Tab.Pane>
        ),
      },
    ];
    return (
      <div className="id-details">
        <div className="header">
          <div className="header__text">
            <h2>{id}</h2>
          </div>
        </div>
        {this.state.loading ? (
          <Loader
            inline
            active={!!this.state.loading}
            content={this.props.loadingMessage}
          />
        ) : (
          <Tab panes={panes} />
        )}
      </div>
    );
  }
}

IdDetails.propTypes = {
  resourceId: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  loadingMessage: PropTypes.string,
  fetchResource: PropTypes.func.isRequired,
  setLoadingMessage: PropTypes.func.isRequired,
};

IdDetails.defaultProps = {
  loadingMessage: '',
};

export default IdDetails;
