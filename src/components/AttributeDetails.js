import React from 'react';
import PropTypes from 'prop-types';
import {Loader, Tab} from 'semantic-ui-react';
import {logErrors, getMonth} from '../utils/common';
import SortableTable from './tables/SortableTable';
import SearchBar from './SearchBar';
import './AttributeDetails.css';

class AttributeDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resourceType: null,
      resourceBaseType: null,
      resourceUrl: null,
      data: [],
      filteredData: [],
      loading: false,
      patients: null,
      shouldGetPatients: false,
      abortController: new AbortController(),
    };
  }

  componentDidMount() {
    this.getResource();
  }

  componentWillUnmount() {
    this.props.setLoadingMessage('');
  }

  getResource = () => {
    const {fetchResource, schemaUrl, baseUrl, resourceId, query} = this.props;
    this.setState({loading: true}, () => {
      this.props.setLoadingMessage(
        query === 'all'
          ? `Fetching all results for ${resourceId}...`
          : `Fetching results for ${query}...`,
      );
      fetchResource(
        `${schemaUrl}/${resourceId}/$snapshot`,
        this.state.abortController,
      )
        .then(async schema => {
          this.setState({
            schema,
            resourceType: schema.name,
            resourceBaseType: schema.type,
            resourceUrl: schema.url,
          });
        })
        .then(async () => {
          let url = `${baseUrl}${this.state.resourceBaseType}?_profile:below=${this.state.resourceUrl}`;
          if (query !== 'all') {
            url = url.concat(`&${query}`);
          }
          this.props
            .fetchAllResources(url, this.state.abortController)
            .then(async data => {
              const mappedData = data
                .map(x => x.resource)
                .map(x => ({
                  id: x.id,
                  lastUpdated:
                    !!x.meta && !!x.meta.lastUpdated
                      ? x.meta.lastUpdated
                      : 'Unknown',
                }));
              this.setState(
                {
                  data: mappedData,
                  filteredData: mappedData,
                },
                async () => {
                  const shouldGetPatients = await this.shouldGetPatients();
                  let patients = null;
                  if (shouldGetPatients) {
                    patients = await this.getPatients();
                  }
                  this.setState({
                    loading: false,
                    shouldGetPatients,
                    patients,
                  });
                },
              );
            })
            .catch(err => logErrors('Error fetching IDs:', err));
        })
        .catch(err => logErrors('Error fetching resource:', err));
    });
  };

  shouldGetPatients = async () => {
    const {getCapabilityStatementReferences, baseUrl, query} = this.props;
    if (query === 'all') {
      return false;
    }
    this.props.setLoadingMessage('Fetching Patients...');
    return getCapabilityStatementReferences(
      `${baseUrl}metadata`,
      'Patient',
      this.state.abortController,
    )
      .then(async references => {
        return (
          references.filter(x => x.type === this.state.resourceBaseType)
            .length > 0
        );
      })
      .catch(err => {
        logErrors('Error fetching Patients:', err);
      });
  };

  getPatients = async () => {
    const {fetchAllResources, baseUrl, query} = this.props;
    return fetchAllResources(
      `${baseUrl}Patient?_has:${this.state.resourceBaseType}:patient:${query}`,
      this.state.abortController,
    )
      .then(data =>
        data
          .map(x => x.resource)
          .map(x => ({
            id: x.id,
            resourceType: x.resourceType,
            lastUpdated:
              !!x.meta && !!x.meta.lastUpdated ? x.meta.lastUpdated : 'Unknown',
          })),
      )
      .catch(err => {
        logErrors('Error fetching all Patients:', err);
      });
  };

  handleResultSelect = searchResults => {
    const filteredData = [];
    searchResults.forEach(result => {
      filteredData.push(this.state.data.find(x => x.id === result.key));
    });
    this.setState({
      filteredData,
    });
  };

  formatDate = str => {
    const date = new Date(str);
    const month = getMonth(date.getMonth());
    const day = date.getDay();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  onRowClick = (row, resourceType) => {
    this.props.history.push(
      `/resources/${resourceType ? resourceType : this.props.resourceId}/id=${
        row.id
      }`,
    );
  };

  render() {
    const secondTab =
      this.props.query !== 'all' && this.state.shouldGetPatients
        ? {
            menuItem: `Patients (${this.state.patients.length})`,
            render: () => (
              <Tab.Pane>
                <SortableTable
                  headerCells={tableHeaders}
                  data={this.state.patients}
                  onRowClick={row => this.onRowClick(row, 'Patient')}
                />
              </Tab.Pane>
            ),
          }
        : {};

    const tableHeaders = [
      {display: 'ID', sortId: 'id', sort: true},
      {
        display: 'Last Updated',
        sortId: 'lastUpdated',
        sort: true,
        func: str => (str !== 'Unknown' ? this.formatDate(str) : str),
      },
    ];
    return (
      <div className="attribute-details">
        <div className="header">
          <div className="header__text">
            <h2>{this.props.query}</h2>
          </div>
        </div>
        <Loader
          inline
          active={!!this.state.loading}
          content={this.props.loadingMessage}
        />
        {this.state.loading ? null : (
          <Tab
            panes={[
              {
                menuItem: `${this.props.resourceId} (${this.state.filteredData.length})`,
                render: () => (
                  <Tab.Pane>
                    <SearchBar
                      className="header__searchbar"
                      data={this.state.data.map(resource => ({
                        key: resource.id,
                        title: resource.id,
                      }))}
                      placeholder="Search for an ID..."
                      handleResultSelect={this.handleResultSelect}
                    />
                    <SortableTable
                      headerCells={tableHeaders}
                      data={this.state.filteredData}
                      onRowClick={this.onRowClick}
                    />
                  </Tab.Pane>
                ),
              },
              {...secondTab},
            ]}
          />
        )}
      </div>
    );
  }
}

export default AttributeDetails;

AttributeDetails.propTypes = {
  fetchAllResources: PropTypes.func.isRequired,
  fetchResource: PropTypes.func.isRequired,
  schemaUrl: PropTypes.string.isRequired,
  baseUrl: PropTypes.string.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      resourceId: PropTypes.string.isRequired,
      query: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  resourceId: PropTypes.string.isRequired,
  query: PropTypes.string,
  setLoadingMessage: PropTypes.func.isRequired,
  loadingMessage: PropTypes.string,
  getCapabilityStatementReferences: PropTypes.func.isRequired,
};

AttributeDetails.defaultProps = {
  loadingMessage: '',
};
