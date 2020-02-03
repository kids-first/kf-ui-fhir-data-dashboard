import React from 'react';
import PropTypes from 'prop-types';
import {Card, Icon} from 'semantic-ui-react';
import {baseUrl, resourceCategories} from '../config';
import './AllResources.css';

class AllResources extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: props.resources,
      resultsFetched: props.allResourcesFetched,
      resourceType: 'StructureDefinition',
      resourceTitle: 'Resource Types',
      totalResults: props.resources ? Object.keys(props.resources).length : 0,
    };
  }

  componentDidMount() {
    if (!this.props.allResourcesFetched) {
      this.setState({resultsFetched: false}, () => {
        this.props
          .fetchAllResources(`${baseUrl}${this.state.resourceType}`)
          .then(() => {
            const results = this.props.resources;
            this.setState({
              totalResults: Object.keys(results).length,
              results,
              resultsFetched: true,
            });
          });
      });
    }
  }

  onClick = resourceType => {
    this.props.history.push(`/${resourceType}`);
  };

  render() {
    const {resourceTitle, totalResults, results, resultsFetched} = this.state;
    return (
      <div className="all-resources">
        <div
          className={`ui ${resultsFetched ? 'disabled' : 'active'} loader`}
        />
        <h2>
          {resourceTitle} ({totalResults})
        </h2>
        {resultsFetched ? (
          <div className="all-resources__results">
            {Object.keys(resourceCategories).map(category => (
              <div className="all-resources__results-category" key={category}>
                <h3>{category}</h3>
                <div className="all-resources__results-subcategory">
                  {Object.keys(resourceCategories[category]).map(
                    subCategory => (
                      <React.Fragment key={subCategory}>
                        <h4>{subCategory}</h4>
                        <div className="all-resources__results-section">
                          {resourceCategories[category][subCategory].map(
                            resultType => (
                              <Card
                                key={resultType}
                                onClick={() => this.onClick(resultType)}
                              >
                                <Card.Content>
                                  <Card.Header>{resultType}</Card.Header>
                                  <Card.Meta>
                                    Total: {results[resultType].count}
                                  </Card.Meta>
                                  <Card.Meta>
                                    Base type: {results[resultType].baseType}
                                  </Card.Meta>
                                  <Card.Description>
                                    Click to explore {resultType}.
                                  </Card.Description>
                                </Card.Content>
                                <Card.Content extra>
                                  <Icon name="user" />
                                </Card.Content>
                              </Card>
                            ),
                          )}
                        </div>
                      </React.Fragment>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
}

AllResources.propTypes = {
  history: PropTypes.object.isRequired,
  fetchAllResources: PropTypes.func.isRequired,
};

export default AllResources;
