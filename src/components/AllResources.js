import React from 'react';
import PropTypes from 'prop-types';
import {Card, Icon} from 'semantic-ui-react';
import {baseUrl, resourceCategories} from '../config';
import SearchBar from './SearchBar';
import './AllResources.css';

class AllResources extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: props.resources,
      filteredResults: props.resources,
      resultsFetched: props.allResourcesFetched,
      resourceType: 'StructureDefinition',
      resourceTitle: 'Resource Types',
      resultsByCategory: resourceCategories,
      openTabs: Object.keys(resourceCategories),
    };
  }

  componentDidMount() {
    if (!this.props.allResourcesFetched) {
      this.setState({resultsFetched: false}, () => {
        this.props
          .fetchAllResources(`${baseUrl}${this.state.resourceType}`)
          .then(() => {
            const results = this.props.resources;
            const resultsByCategory = this.setCategories(results);
            this.setState({
              results,
              filteredResults: results,
              resultsFetched: true,
              resultsByCategory,
            });
          });
      });
    }
  }

  onClick = resourceType => {
    this.props.history.push(`/${resourceType}`);
  };

  handleResultSelect = searchResults => {
    const allResults = this.state.results;
    const newResults = {};
    searchResults.forEach(
      result => (newResults[result.title] = allResults[result.title]),
    );
    this.setState({filteredResults: newResults});
  };

  setCategories = results => {
    let resultsByCategory = resourceCategories;
    let flatCategories = new Set(
      Object.keys(resourceCategories)
        .map(category =>
          Object.keys(resourceCategories[category])
            .map(subCategory => resourceCategories[category][subCategory])
            .flat(),
        )
        .flat(),
    );
    const uncategorizedResults = Object.keys(results).filter(
      result => !flatCategories.has(results[result].name),
    );
    uncategorizedResults.forEach(result => {
      Object.keys(resourceCategories).forEach(category => {
        Object.keys(resourceCategories[category]).forEach(subCategory => {
          if (
            resourceCategories[category][subCategory].includes(
              results[result].baseType,
            )
          ) {
            resultsByCategory[category][subCategory].push(result);
          }
        });
      });
    });
    return resultsByCategory;
  };

  toggleTab = tab => {
    let openTabs = this.state.openTabs;
    const index = openTabs.indexOf(tab);
    index > -1 ? openTabs.splice(index, 1) : openTabs.push(tab);
    this.setState({openTabs});
  };

  expandAllTabs = () => {
    this.setState({openTabs: Object.keys(this.state.resultsByCategory)});
  };

  collapseAllTabs = () => {
    this.setState({openTabs: []});
  };

  getCategoryCount = categoryName => {
    const {resultsByCategory, filteredResults} = this.state;
    const category = resultsByCategory[categoryName];
    return Object.keys(category)
      .map(subCategory => category[subCategory].filter(x => filteredResults[x]))
      .flat().length;
  };

  getSubCategoryCount = (categoryName, subCategoryName) => {
    const {resultsByCategory, filteredResults} = this.state;
    return resultsByCategory[categoryName][subCategoryName].filter(
      x => filteredResults[x],
    ).length;
  };

  render() {
    const {
      resourceTitle,
      results,
      resultsFetched,
      filteredResults,
      resultsByCategory,
      openTabs,
    } = this.state;
    return (
      <div className="all-resources">
        <div
          className={`ui ${resultsFetched ? 'disabled' : 'active'} loader`}
        />
        <h2>
          {resourceTitle} ({Object.keys(filteredResults).length})
        </h2>
        {resultsFetched ? (
          <div className="all-resources__results">
            <SearchBar
              data={Object.keys(results).map(key => ({
                title: results[key].name,
              }))}
              handleResultSelect={this.handleResultSelect}
            />
            <div className="all-resources__results-expand">
              <p onClick={() => this.expandAllTabs()}>Expand All</p>
              <p> | </p>
              <p onClick={() => this.collapseAllTabs()}>Collapse All</p>
            </div>
            {Object.keys(resultsByCategory).map(category => {
              const categoryCount = this.getCategoryCount(category);
              return (
                <div className="all-resources__results-category" key={category}>
                  <div className="all-resources__results-category-header">
                    <h3>
                      {category}: {categoryCount}
                    </h3>
                    <Icon
                      name={
                        openTabs.includes(category) && categoryCount > 0
                          ? 'chevron up'
                          : 'chevron down'
                      }
                      onClick={() => {
                        if (categoryCount > 0) {
                          this.toggleTab(category);
                        }
                      }}
                    />
                  </div>
                  {openTabs.includes(category) && categoryCount > 0 ? (
                    <div className="all-resources__results-subcategory">
                      {Object.keys(resultsByCategory[category]).map(
                        subCategory => {
                          const subCategoryCount = this.getSubCategoryCount(
                            category,
                            subCategory,
                          );
                          if (subCategoryCount > 0) {
                            return (
                              <React.Fragment key={subCategory}>
                                <h4>{subCategory}</h4>
                                <div className="all-resources__results-section">
                                  {resultsByCategory[category][subCategory].map(
                                    resultType => {
                                      const result =
                                        filteredResults[resultType];
                                      if (result) {
                                        return (
                                          <Card
                                            key={resultType}
                                            onClick={() =>
                                              this.onClick(resultType)
                                            }
                                          >
                                            <Card.Content>
                                              <Card.Header>
                                                {resultType}
                                              </Card.Header>
                                              <Card.Meta>
                                                Total:{' '}
                                                {results[resultType].count}
                                              </Card.Meta>
                                              <Card.Meta>
                                                Base type:{' '}
                                                {results[resultType].baseType}
                                              </Card.Meta>
                                              <Card.Description>
                                                Click to explore {resultType}.
                                              </Card.Description>
                                            </Card.Content>
                                          </Card>
                                        );
                                      }
                                      return null;
                                    },
                                  )}
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

AllResources.propTypes = {
  history: PropTypes.object.isRequired,
  fetchAllResources: PropTypes.func.isRequired,
  resources: PropTypes.object,
  allResourcesFetched: PropTypes.bool,
};

AllResources.defaultProps = {
  resources: {},
  allResourcesFetched: false,
};

export default AllResources;
