import React from 'react';
import PropTypes from 'prop-types';
import {Loader} from 'semantic-ui-react';
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
              this.setState({
                data: mappedData,
                filteredData: mappedData,
                loading: false,
              });
            })
            .catch(err => logErrors('Error fetching IDs:', err));
        })
        .catch(err => logErrors('Error fetching resource:', err));
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

  onRowClick = row => {
    this.props.history.push(`/resources/${this.props.resourceId}/id=${row.id}`);
  };

  render() {
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
            <h3>{this.state.filteredData.length} total</h3>
          </div>
          <SearchBar
            className="header__searchbar"
            data={this.state.data.map(resource => ({
              key: resource.id,
              title: resource.id,
            }))}
            placeholder="Search for an ID..."
            handleResultSelect={this.handleResultSelect}
          />
        </div>
        <Loader
          inline
          active={!!this.state.loading}
          content={this.props.loadingMessage}
        />
        {!this.state.loading ? (
          <SortableTable
            headerCells={tableHeaders}
            data={this.state.filteredData}
            onRowClick={this.onRowClick}
          />
        ) : null}
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
};

AttributeDetails.defaultProps = {
  loadingMessage: '',
};
