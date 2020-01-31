import React from 'react';
import PropTypes from 'prop-types';
import {baseUrl} from '../config';
import AppBreadcrumb from './AppBreadcrumb';
import './ResourceDetails.css';

class ResourceDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resourceType: props.resourceType,
      resultsFetched: props.resultsFetched,
      total: props.total,
    };
  }

  componentDidMount() {
    if (!this.state.resultsFetched) {
      this.getResource();
    }
  }

  getResource = () => {
    this.setState({resultsFetched: false}, async () => {
      const total = await this.props.getCount(
        `${baseUrl}${this.state.resourceType}`,
      );
      this.setState({
        resultsFetched: true,
        total,
      });
    });
  };

  render() {
    console.log('this.props', this.props);
    console.log('this.state', this.state);
    const {resourceType, total} = this.state;
    return (
      <div className="resource-details">
        <AppBreadcrumb history={this.props.history} />
        <div
          className={`ui ${
            this.state.resultsFetched ? 'disabled' : 'active'
          } loader`}
        />
        {resourceType}: {total}
      </div>
    );
  }
}

ResourceDetails.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      resourceType: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  results: PropTypes.object,
  resourceType: PropTypes.string.isRequired,
  hasResources: PropTypes.bool,
  getCount: PropTypes.func.isRequired,
  total: PropTypes.number,
};

ResourceDetails.defaultProps = {
  results: {},
  hasResources: false,
  total: 0,
};

export default ResourceDetails;
