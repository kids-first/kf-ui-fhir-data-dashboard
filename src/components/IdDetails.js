import React from 'react';
import PropTypes from 'prop-types';
import {Loader, Tab} from 'semantic-ui-react';
import ReactJson from 'react-json-view';
import {logErrors} from '../utils/common';
import ReferenceTable from './tables/ReferenceTable';
import SortableTable from './tables/SortableTable';
import './IdDetails.css';

class IdDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      payload: {},
      ontologyResources: [],
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
      history,
    } = this.props;
    this.setState({loading: true}, () => {
      setLoadingMessage(`Fetching information for ${id}...`);
      fetchResource(`${schemaUrl}/${resourceId}`, this.state.abortController)
        .then(data => {
          const type = data.type;
          fetchResource(`${baseUrl}${type}/${id}`, this.state.abortController)
            .then(data => {
              this.setState({payload: data}, () => {
                if (history.location.pathname.includes('/ontologies')) {
                  this.getOntologyResources()
                    .then(resources => {
                      console.log('resources', resources);
                      this.setState({
                        ontologyResources: resources,
                        loading: false,
                      });
                    })
                    .catch(err =>
                      logErrors(
                        `Error getting resources that use ontology ${id}`,
                        err,
                      ),
                    );
                } else {
                  this.setState({loading: false});
                }
              });
            })
            .catch(err => logErrors(`Error getting payload for ${id}:`, err));
        })
        .catch(err =>
          logErrors(`Error getting schema for ${resourceId}:`, err),
        );
    });
  };

  getOntologyResources = () => {
    const {id, baseUrl, setLoadingMessage, fetchAllResources} = this.props;
    const {payload} = this.state;
    setLoadingMessage(`Fetching resources for ${id}...`);
    return fetchAllResources(
      `${baseUrl}StructureDefinition?valueset=${payload.valueSet}`,
      this.state.abortController,
    )
      .then(data => (data ? data.map(x => x.resource) : []))
      .catch(err => {
        throw err;
      });
  };

  onOntologyRowClick = row => {
    this.props.history.push(`/resources/${row.id}`);
  };

  render() {
    const {id, history} = this.props;
    const {payload, ontologyResources} = this.state;
    console.log('ontologyResources', ontologyResources);
    const referenceTableHeaders = [
      {display: 'Resource Type', sortId: 'resourceType', sort: true},
      {display: 'Resource Name', sortId: 'name', sort: true},
      {display: 'Profile', sortId: 'profile', sort: true},
      {display: 'Total References', sortId: 'total', sort: true},
    ];
    const resourceTableHeaders = [
      {display: 'Resource ID', sortId: 'id', sort: true},
      {display: 'Resource Name', sortId: 'name', sort: true},
      {display: 'URL', sortId: 'url', sort: true},
    ];
    const secondTab = history.location.pathname.includes('/resources')
      ? {
          menuItem: 'References',
          render: () => (
            <Tab.Pane>
              <ReferenceTable
                resource={payload}
                tableHeaders={referenceTableHeaders}
                baseUrl={this.props.baseUrl}
                setLoadingMessage={this.props.setLoadingMessage}
                loadingMessage={this.props.loadingMessage}
                history={this.props.history}
              />
            </Tab.Pane>
          ),
        }
      : {
          menuItem: `Resources Utilizing ${id} (${ontologyResources.length})`,
          render: () => (
            <Tab.Pane>
              {ontologyResources.length > 0 ? (
                <SortableTable
                  headerCells={resourceTableHeaders}
                  data={ontologyResources}
                  onRowClick={this.onOntologyRowClick}
                />
              ) : (
                <p>No resources utilize this ontology.</p>
              )}
            </Tab.Pane>
          ),
        };
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
  fetchAllResources: PropTypes.func.isRequired,
  setLoadingMessage: PropTypes.func.isRequired,
  getOntologies: PropTypes.func,
  ontologies: PropTypes.object,
  ontologiesFetched: PropTypes.bool,
};

IdDetails.defaultProps = {
  resourceId: 'CodeSystem',
  loadingMessage: '',
  getOntologies: () => {},
  ontologies: {},
  ontologiesFetched: false,
};

export default IdDetails;
