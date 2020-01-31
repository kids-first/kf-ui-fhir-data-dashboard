import React from 'react';
import PropTypes from 'prop-types';
import {baseUrl} from '../config';
import Dashboard from './Dashboard';
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
            console.log('received results', results);
            this.setState({
              totalResults: Object.keys(results).length,
              results,
              resultsFetched: true,
            });
          });
      });
    }
  }

  onResourceClick = resourceType => {
    this.props.history.push(`/${resourceType}`);
  };

  render() {
    console.log('this.props', this.props);
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
  fetchAllResources: PropTypes.func.isRequired,
};

export default AllResources;
