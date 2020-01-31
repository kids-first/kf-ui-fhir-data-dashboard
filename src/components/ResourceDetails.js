import React from 'react';
import PropTypes from 'prop-types';
import {fetchResource} from '../utils/api';
import {baseUrl} from '../config';
import AppBreadcrumb from './AppBreadcrumb';
import './ResourceDetails.css';

class ResourceDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resourceType: props.match.params.resourceType,
      resultsFetched: false,
      results: [],
    };
  }

  componentDidMount() {
    fetchResource(`${baseUrl}${this.state.resourceType}`);
  }

  render() {
    const {resourceType} = this.state;
    return (
      <div className="resource-details">
        <AppBreadcrumb history={this.props.history} />
        Resource Details for {resourceType}
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
};

export default ResourceDetails;
