import React from 'react';
import PropTypes from 'prop-types';
import {Card, Icon, Loader} from 'semantic-ui-react';
import Avatar from 'react-avatar';
import _ from 'lodash';
import {getHumanReadableNumber, logErrors} from '../utils/common';
import SearchBar from './SearchBar';
import SortableTable from './tables/SortableTable';
import './Homepage.css';

class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredResources: props.allResources,
      listResources: _.toArray(props.allResources),
      searchResourceType: 'StructureDefinition',
      searchResourceTitle: 'Resource Types',
      abortController: new AbortController(),
    };
  }

  componentDidMount() {
    if (!this.props.allResourcesFetched) {
      this.fetchAllResources();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.baseUrl !== prevProps.baseUrl) {
      this.fetchAllResources();
    }
  }

  componentWillUnmount() {
    this.state.abortController.abort();
  }

  fetchAllResources = () => {
    this.props
      .fetchAllResources(
        this.props.baseUrl,
        this.state.searchResourceType,
        this.state.abortController,
      )
      .then(() => {
        this.setState({
          filteredResources: this.props.allResources,
          listResources: _.toArray(this.props.allResources),
        });
      })
      .catch(err => logErrors('Error fetching resources:', err));
  };

  onClick = resource => {
    this.props.history.push(`/${resource.id}`);
  };

  handleResultSelect = searchResults => {
    const {allResources} = this.props;
    const filteredResources = {};
    searchResults.forEach(result => {
      filteredResources[result.key] = allResources[result.key];
    });
    this.setState({
      filteredResources,
      listResources: _.toArray(filteredResources),
    });
  };

  selectApi = (e, {value}) => {
    this.setState({filteredResources: {}}, () => {
      this.props.setBaseUrl(value);
    });
  };

  getIcon = (resourceType, resourceBaseType) => {
    const iconColor = '#005788';
    switch (resourceBaseType) {
      case 'Patient':
        return <Icon circular inverted name="user" />;
      case 'Specimen':
        return <Icon circular inverted name="lab" />;
      case 'Group':
        return <Icon circular inverted name="users" />;
      case 'Condition':
        return <Icon circular inverted name="bug" />;
      case 'Observation':
        return <Icon circular inverted name="eye" />;
      case 'Practitioner':
        return <Icon circular inverted name="doctor" />;
      case 'Encounter':
        return <Icon circular inverted name="clipboard" />;
      default:
        return (
          <Avatar
            name={resourceType
              .split(/(?=[A-Z])/)
              .slice(0, 4)
              .join(' ')}
            size={90}
            round="50px"
            color={iconColor}
          />
        );
    }
  };

  toggleView = view => {
    switch (view) {
      case 'grid':
        return this.props.setHomepageView(true);
      case 'list':
        return this.props.setHomepageView(false);
      default:
        return;
    }
  };

  render() {
    const {searchResourceTitle, filteredResources, listResources} = this.state;
    const {allResources, allResourcesFetched, cardView} = this.props;
    const tableHeaders = [
      {display: 'Name', sortId: 'name'},
      {display: 'ID', sortId: 'id'},
      {display: 'Base Type', sortId: 'baseType'},
      {display: 'FHIR Module', sortId: 'module'},
      {display: 'FHIR Category', sortId: 'category'},
      {display: '#', sortId: 'count', func: str => getHumanReadableNumber(str)},
    ];
    return (
      <div className="homepage">
        <div className="header">
          <div className="header__text">
            <h2>{searchResourceTitle}</h2>
            <h3>
              {getHumanReadableNumber(Object.keys(filteredResources).length)}{' '}
              total
            </h3>
          </div>
          <div className="header__controls">
            <div className="header__controls-view">
              <Icon
                inverted
                bordered
                className={'header__controls-view-icon'.concat(
                  !cardView ? '--selected' : '',
                )}
                name="list"
                onClick={() => this.toggleView('list')}
              />
              <Icon
                className={'header__controls-view-icon'.concat(
                  cardView ? '--selected' : '',
                )}
                inverted
                bordered
                name="grid layout"
                onClick={() => this.toggleView('grid')}
              />
            </div>
            <SearchBar
              className="header__searchbar"
              data={Object.keys(allResources).map(key => ({
                key,
                title: allResources[key].name || key,
              }))}
              handleResultSelect={this.handleResultSelect}
            />
          </div>
        </div>
        <Loader
          inline
          active={allResourcesFetched ? false : true}
          content={this.props.loadingMessage}
        />
        {allResourcesFetched && cardView ? (
          <div className="homepage__section-resources">
            {this.props.sortedResources.map(elt => {
              const resource = filteredResources[elt.id];
              if (resource) {
                return (
                  <Card
                    key={resource.id}
                    onClick={() => this.onClick(resource)}
                  >
                    <Card.Content>
                      <Card.Header>{resource.name}</Card.Header>
                      <Card.Meta>Base type: {resource.baseType}</Card.Meta>
                      <Card.Description>
                        <div id="homepage__card-description">
                          {this.getIcon(resource.name, resource.baseType)}
                          <div className="homepage__card-description-count">
                            {getHumanReadableNumber(resource.count)}
                          </div>
                        </div>
                      </Card.Description>
                    </Card.Content>
                  </Card>
                );
              } else return null;
            })}
          </div>
        ) : null}
        {allResourcesFetched && !cardView ? (
          <SortableTable
            headerCells={tableHeaders}
            data={listResources}
            onRowClick={this.onClick}
          />
        ) : null}
      </div>
    );
  }
}

Homepage.propTypes = {
  history: PropTypes.object.isRequired,
  fetchAllResources: PropTypes.func.isRequired,
  allResources: PropTypes.object,
  allResourcesFetched: PropTypes.bool,
  baseUrl: PropTypes.string.isRequired,
  setBaseUrl: PropTypes.func.isRequired,
  cardView: PropTypes.bool,
  setHomepageView: PropTypes.func.isRequired,
  loadingMessage: PropTypes.string,
  serverOptions: PropTypes.array,
};

Homepage.defaultProps = {
  allResources: {},
  allResourcesFetched: false,
  cardView: true,
  loadingMessage: '',
  serverOptions: [],
};

export default Homepage;
