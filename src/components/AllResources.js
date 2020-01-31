import React from 'react';
import PropTypes from 'prop-types';
import {fetchAllResources, getResourceCount} from '../utils/api';
import {baseUrl, resourceCategories} from '../config';
import Dashboard from './Dashboard';
import './AllResources.css';

class AllResources extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: {},
      resultsFetched: false,
      resourceType: 'StructureDefinition',
      resourceTitle: 'Resource Types',
    };
  }

  componentDidMount() {
    this.getResourceType();
  }

  getResourceType = async () => {
    this.setState({resultsFetched: false}, async () => {
      let results = await fetchAllResources(
        `${baseUrl}${this.state.resourceType}`,
        [],
      );
      results = results ? await this.setResourceCounts(results) : [];
      results = this.formatResults(results);
      this.setState({
        totalResults: Object.keys(results).length,
        results,
        resultsFetched: true,
      });
    });
  };

  setResourceCounts = async results =>
    await Promise.all(
      results.map(async result => {
        if (this.showResourceType(result.resource.type)) {
          return {
            baseType: result.resource.type,
            name: result.resource.name,
            count: await getResourceCount(`${baseUrl}${result.resource.type}`),
          };
        }
      }),
    );

  formatResults = results => {
    let newResults = {};
    results.forEach(result => {
      if (result) {
        newResults[result.name] = {
          ...result,
        };
      }
    });
    return newResults;
  };

  showResourceType = resourceType => {
    let showResource = false;
    Object.keys(resourceCategories).forEach(category => {
      Object.keys(resourceCategories[category]).forEach(subCategory => {
        if (resourceCategories[category][subCategory].includes(resourceType)) {
          showResource = true;
        }
      });
    });
    return showResource;
  };

  onResourceClick = resourceType => {
    this.props.history.push(`/${resourceType}`);
  };

  render() {
    return (
      <div className="all-resources">
        <div
          className={`ui ${
            this.state.resultsFetched ? 'disabled' : 'active'
          } loader`}
        />
        <Dashboard
          items={this.state.results}
          title={this.state.resourceTitle}
          resourceType={this.state.resourceType}
          onClick={this.onResourceClick}
          total={this.state.totalResults}
        />
      </div>
    );
  }
}

AllResources.propTypes = {
  history: PropTypes.object.isRequired,
};

export default AllResources;
