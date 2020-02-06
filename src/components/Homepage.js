import React from 'react';
import PropTypes from 'prop-types';
import {Card, Icon} from 'semantic-ui-react';
import {getHumanReadableNumber} from '../utils/common';
import {baseUrl, resourceCategories} from '../config';
import SearchBar from './SearchBar';
import './Homepage.css';

class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resources: props.allResources,
      filteredResources: props.allResources,
      resourcesFetched: props.allResourcesFetched,
      searchResourceType: 'StructureDefinition',
      searchResourceTitle: 'Resource Types',
      resourcesByCategory: resourceCategories,
      openTabs: Object.keys(resourceCategories),
    };
  }

  componentDidMount() {
    if (!this.props.allResourcesFetched) {
      this.setState({resourcesFetched: false}, () => {
        this.props
          .fetchAllResources(`${baseUrl}${this.state.searchResourceType}`)
          .then(() => {
            const resources = this.props.allResources;
            const resourcesByCategory = this.setCategories(resources);
            this.setState({
              resources,
              filteredResources: resources,
              resourcesFetched: true,
              resourcesByCategory,
            });
          });
      });
    }
  }

  setCategories = resources => {
    let resourcesByCategory = resourceCategories;
    let flatCategories = new Set(
      Object.keys(resourceCategories)
        .map(category =>
          Object.keys(resourceCategories[category])
            .map(subCategory => resourceCategories[category][subCategory])
            .flat(),
        )
        .flat(),
    );
    const uncategorizedResources = Object.keys(resources).filter(
      resource => !flatCategories.has(resources[resource].name),
    );
    uncategorizedResources.forEach(resource => {
      Object.keys(resourceCategories).forEach(category => {
        Object.keys(resourceCategories[category]).forEach(subCategory => {
          if (
            resourceCategories[category][subCategory].includes(
              resources[resource].baseType,
            )
          ) {
            resourcesByCategory[category][subCategory].push(resource);
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
    const allResources = this.state.resources;
    const filteredResources = {};
    searchResults.forEach(
      result => (filteredResources[result.title] = allResources[result.title]),
    );
    this.setState({filteredResources});
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
        category[subCategory].filter(x => filteredResources[x]),
      )
      .flat().length;
  };

  getSubCategoryCount = (categoryName, subCategoryName) => {
    const {resourcesByCategory, filteredResources} = this.state;
    return resourcesByCategory[categoryName][subCategoryName].filter(
      x => filteredResources[x],
    ).length;
  };

  render() {
    const {
      searchResourceTitle,
      resources,
      resourcesFetched,
      filteredResources,
      resourcesByCategory,
      openTabs,
    } = this.state;
    return (
      <div className="homepage">
        <div
          className={`ui ${resourcesFetched ? 'disabled' : 'active'} loader`}
        />
        <h2>
          {searchResourceTitle} (
          {getHumanReadableNumber(Object.keys(filteredResources).length)})
        </h2>
        {resourcesFetched ? (
          <div className="homepage__content">
            <SearchBar
              data={Object.keys(resources).map(key => ({
                title: resources[key].name,
              }))}
              handleResultSelect={this.handleResultSelect}
            />
            <div className="homepage__section-controls">
              <p onClick={() => this.expandAllTabs()}>Expand All</p>
              <p> | </p>
              <p onClick={() => this.collapseAllTabs()}>Collapse All</p>
            </div>
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
                                  {resourcesByCategory[category][
                                    subCategory
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
                                              Total:{' '}
                                              {getHumanReadableNumber(
                                                resources[resourceType].count,
                                              )}
                                            </Card.Meta>
                                            <Card.Meta>
                                              Base type:{' '}
                                              {resources[resourceType].baseType}
                                            </Card.Meta>
                                            <Card.Description>
                                              Click to explore {resourceType}.
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
      </div>
    );
  }
}

Homepage.propTypes = {
  history: PropTypes.object.isRequired,
  fetchAllResources: PropTypes.func.isRequired,
  allResources: PropTypes.object,
  allResourcesFetched: PropTypes.bool,
};

Homepage.defaultProps = {
  allResources: {},
  allResourcesFetched: false,
};

export default Homepage;
