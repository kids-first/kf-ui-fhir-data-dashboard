import React from 'react';
import PropTypes from 'prop-types';
import {Loader, Tab} from 'semantic-ui-react';
import ReactJson from 'react-json-view';
import {logErrors} from '../utils/common';
import ReferenceTable from './tables/ReferenceTable';
import Timeline from './tables/Timeline';
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

  componentWillUnmount() {
    this.props.setLoadingMessage('');
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
    const {id, history} = this.props;
    const {payload} = this.state;
    const tableHeaders = [
      {display: 'Resource Type', sortId: 'resourceType', sort: true},
      {display: 'Resource Name', sortId: 'name', sort: true},
      {display: 'Profile', sortId: 'profile', sort: true},
      {display: 'Total References', sortId: 'total', sort: true},
    ];
    let secondTab = null;
    if (history.location.pathname.includes('/resources')) {
      secondTab =
        payload.resourceType !== 'Patient'
          ? {
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
            }
          : {
              menuItem: 'Timeline',
              render: () => (
                <Tab.Pane>
                  <Timeline
                    resource={payload}
                    baseUrl={this.props.baseUrl}
                    setLoadingMessage={this.props.setLoadingMessage}
                    loadingMessage={this.props.loadingMessage}
                    history={this.props.history}
                    dateFieldPath={resource => {
                      if (resource && resource.extension) {
                        const valueAge = resource.extension
                          .map(x => x.valueAge)
                          .filter(x => x);
                        if (valueAge && valueAge.length > 0) {
                          return valueAge[0].value;
                        }
                      }
                      return null;
                    }}
                  />
                </Tab.Pane>
              ),
            };
    }
    const panes = [
      {
        menuItem: 'Payload',
        render: () => (
          <Tab.Pane>
            <ReactJson src={payload} />
          </Tab.Pane>
        ),
      },
      {...secondTab},
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
  resourceId: PropTypes.string,
  id: PropTypes.string.isRequired,
  loadingMessage: PropTypes.string,
  fetchResource: PropTypes.func.isRequired,
  setLoadingMessage: PropTypes.func.isRequired,
};

IdDetails.defaultProps = {
  resourceId: 'CodeSystem',
  loadingMessage: '',
};

export default IdDetails;
