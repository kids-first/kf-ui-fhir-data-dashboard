import React from 'react';
import PropTypes from 'prop-types';
import {Card, Icon, Dropdown} from 'semantic-ui-react';
import Avatar from 'react-avatar';
import _ from 'lodash';
import {getHumanReadableNumber} from '../utils/common';
import {resourceCategories, defaultFhirAPIs} from '../config';
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
      resourcesByCategory: resourceCategories,
      openTabs: Object.keys(resourceCategories),
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

  fetchAllResources = () => {
    this.props
      .fetchAllResources(this.props.baseUrl, this.state.searchResourceType)
      .then(() => {
        const resources = this.props.allResources;
        const resourcesByCategory = this.setCategories(resources);
        this.setState({
          filteredResources: resources,
          listResources: _.toArray(resources),
          resourcesByCategory,
        });
      });
  };

  setCategories = resources => {
    let resourcesByCategory = resourceCategories;
    let flatCategories = new Set(
      Object.keys(resourceCategories).map(category =>
        Object.keys(resourceCategories[category]).map(
          subCategory => resourceCategories[category][subCategory],
        ),
      ),
    );
    const uncategorizedResources = Object.keys(resources).filter(
      resource => !flatCategories.has(resources[resource].name),
    );
    uncategorizedResources.forEach(resource => {
      Object.keys(resourceCategories).forEach(category => {
        Object.keys(resourceCategories[category]).forEach(subCategory => {
          if (
            resourceCategories[category][subCategory].has(
              resources[resource].baseType,
            )
          ) {
            resourcesByCategory[category][subCategory].add(resource);
            resources[resource].module = category;
            resources[resource].category = subCategory;
          }
        });
      });
    });
    return resourcesByCategory;
  };

  onClick = resource => {
    this.props.history.push(
      `/${resource.baseType}?name=${resource.name}&url=${resource.url}`,
    );
  };

  handleResultSelect = searchResults => {
    const {allResources} = this.props;
    const filteredResources = {};
    searchResults.forEach(result => {
      filteredResources[result.title] = allResources[result.title];
    });
    this.setState({
      filteredResources,
      listResources: _.toArray(filteredResources),
    });
  };

  toggleTab = tab => {
    let openTabs = this.state.openTabs;
    const index = openTabs.indexOf(tab);
    index > -1 ? openTabs.splice(index, 1) : openTabs.push(tab);
    this.setState({openTabs});
  };

  expandAllTabs = () => {
    this.setState({openTabs: Object.keys(this.state.resourcesByCategory)});
  };

  collapseAllTabs = () => {
    this.setState({openTabs: []});
  };

  getCategoryCount = categoryName => {
    const {resourcesByCategory, filteredResources} = this.state;
    const category = resourcesByCategory[categoryName];
    return Object.keys(category)
      .map(subCategory =>
        [...category[subCategory]].filter(x => filteredResources[x]),
      )
      .flat().length;
  };

  getSubCategoryCount = (categoryName, subCategoryName) => {
    const {resourcesByCategory, filteredResources} = this.state;
    return [...resourcesByCategory[categoryName][subCategoryName]].filter(
      x => filteredResources[x],
    ).length;
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
    const {
      searchResourceTitle,
      filteredResources,
      listResources,
      resourcesByCategory,
      openTabs,
    } = this.state;
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
        <div
          className={`ui ${allResourcesFetched ? 'disabled' : 'active'} loader`}
        />
        <div className="homepage__header">
          <div className="homepage__header-title">
            <h2>{searchResourceTitle}:</h2>
            <h2 className="homepage__count">
              {getHumanReadableNumber(Object.keys(filteredResources).length)}
            </h2>
            <h2>total</h2>
          </div>
          <Dropdown
            defaultValue={this.props.baseUrl}
            selection
            options={defaultFhirAPIs}
            onChange={this.selectApi}
            disabled={!this.props.allResourcesFetched}
          />
        </div>
        <div className="homepage__controls">
          <div className="homepage__controls-tabs">
            <p onClick={() => this.expandAllTabs()}>Expand All</p>
            <p> | </p>
            <p onClick={() => this.collapseAllTabs()}>Collapse All</p>
          </div>
          <div className="homepage__header-search">
            <SearchBar
              className="homepage__searchbar"
              data={Object.keys(allResources).map(key => ({
                title: allResources[key].name,
              }))}
              handleResultSelect={this.handleResultSelect}
            />
          </div>
        </div>
        <div className="homepage__controls-view">
          <Icon
            inverted
            bordered
            className={'homepage__controls-view-icon'.concat(
              !cardView ? '--selected' : '',
            )}
            name="list"
            onClick={() => this.toggleView('list')}
          />
          <Icon
            className={'homepage__controls-view-icon'.concat(
              cardView ? '--selected' : '',
            )}
            inverted
            bordered
            name="grid layout"
            onClick={() => this.toggleView('grid')}
          />
        </div>
        {allResourcesFetched && cardView ? (
          <div className="homepage__content">
            {Object.keys(resourcesByCategory).map(category => {
              const categoryCount = this.getCategoryCount(category);
              const showSection =
                openTabs.includes(category) && categoryCount > 0;
              return (
                <div className="homepage__section" key={category}>
                  <div className="homepage__section-header">
                    <h3>
                      {category}: {getHumanReadableNumber(categoryCount)}
                    </h3>
                    <Icon
                      name={showSection ? 'chevron up' : 'chevron down'}
                      onClick={() => {
                        if (categoryCount > 0) {
                          this.toggleTab(category);
                        }
                      }}
                    />
                  </div>
                  {showSection ? (
                    <div className="homepage__section-subcategory">
                      {Object.keys(resourcesByCategory[category]).map(
                        subCategory => {
                          const subCategoryCount = this.getSubCategoryCount(
                            category,
                            subCategory,
                          );
                          if (subCategoryCount > 0) {
                            return (
                              <React.Fragment key={subCategory}>
                                <h4>{subCategory}</h4>
                                <div className="homepage__section-resources">
                                  {[
                                    ...resourcesByCategory[category][
                                      subCategory
                                    ],
                                  ].map(resourceType => {
                                    const resource =
                                      filteredResources[resourceType];
                                    if (resource) {
                                      return (
                                        <Card
                                          key={resourceType}
                                          onClick={() => this.onClick(resource)}
                                        >
                                          <Card.Content>
                                            <Card.Header>
                                              {resourceType}
                                            </Card.Header>
                                            <Card.Meta>
                                              Base type:{' '}
                                              {
                                                filteredResources[resourceType]
                                                  .baseType
                                              }
                                            </Card.Meta>
                                            <Card.Description>
                                              <div id="homepage__card-description">
                                                {this.getIcon(
                                                  resourceType,
                                                  filteredResources[
                                                    resourceType
                                                  ].baseType,
                                                )}
                                                <div className="homepage__card-description-count">
                                                  {getHumanReadableNumber(
                                                    filteredResources[
                                                      resourceType
                                                    ].count,
                                                  )}
                                                </div>
                                              </div>
                                            </Card.Description>
                                          </Card.Content>
                                        </Card>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              </React.Fragment>
                            );
                          }
                          return null;
                        },
                      )}
                    </div>
                  ) : null}
                </div>
              );
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
};

Homepage.defaultProps = {
  allResources: {},
  allResourcesFetched: false,
  cardView: true,
};

export default Homepage;
