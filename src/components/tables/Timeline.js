import React from 'react';
import PropTypes from 'prop-types';
import {getReferencedBy} from '../../utils/api';
import {logErrors} from '../../utils/common';
import DataScatterChart from '../DataScatterChart';

class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingReferences: false,
      loadingDates: false,
      referencedByData: null,
      filteredReferencedByData: null,
      dates: [],
      flatData: [],
      categories: [],
      abortController: new AbortController(),
    };
  }

  componentDidMount() {
    this.fetchAllReferences();
  }

  componentDidUpdate(prevProps) {
    if (this.props.resource.resourceId !== prevProps.resource.resourceId) {
      this.fetchAllReferences();
    }
  }

  componentWillUnmount() {
    this.state.abortController.abort();
    this.props.setLoadingMessage('');
  }

  fetchAllReferences = async () => {
    this.setState({loadingReferences: true, loadingDates: true}, async () => {
      this.props.setLoadingMessage(
        `Loading timeline for ${this.props.resource.id}...`,
      );
      await this.fetchReferencedBy()
        .then(async referencedByData => {
          this.getDataByDate(referencedByData);
          this.setState({
            referencedByData,
            loadingReferences: false,
            filteredReferencedByData: referencedByData,
          });
        })
        .catch(err =>
          logErrors('Error getting resources that reference ID:', err),
        );
    });
  };

  fetchReferencedBy = async () => {
    return await getReferencedBy(
      this.props.baseUrl,
      this.props.resource.resourceType,
      this.props.resource.id,
      this.state.abortController,
    )
      .then(references => this.getReferenceMap(references))
      .catch(err => {
        throw err;
      });
  };

  getReferenceMap = references => {
    let uniqueReferences = {};
    references.forEach(reference => {
      const mapValue = uniqueReferences[reference.profile];
      if (!!mapValue) {
        uniqueReferences[reference.profile] = {
          ...mapValue,
          total: mapValue.total + 1,
          children: mapValue.children.concat(reference),
        };
      } else {
        uniqueReferences[reference.profile] = {
          id: `${reference.resourceType}-${reference.name}`,
          resourceType: reference.resourceType,
          name: reference.name,
          profile: reference.profile,
          total: 1,
          children: [reference],
        };
      }
    });
    return Object.values(uniqueReferences);
  };

  getDataByDate = data => {
    let flatData = [];
    let categories = [''];
    let dates = new Set();
    data.forEach((resource, i) => {
      categories.push(resource.resourceType);
      resource.children.forEach(child => {
        const date = this.props.dateFieldPath(child);
        if (date) {
          flatData.push({category: i + 1, date, ...child});
          dates.add(date);
        }
      });
    });
    dates = [...dates];
    this.setState({dates, categories, flatData, loadingDates: false});
  };

  render() {
    return (
      <div className="timeline">
        <div
          className={`ui ${
            this.state.loadingReferences ? 'active' : 'disabled'
          } loader`}
        >
          <p>{this.props.loadingMessage}</p>
        </div>
        {this.state.filteredReferencedByData &&
        !this.state.loadingReferences &&
        !this.state.loadingDates ? (
          <div>
            <DataScatterChart
              categories={this.state.categories}
              data={this.state.flatData}
              dates={this.state.dates}
              referenceLine={{x: 3294, label: 'COVID-19 Diagnosis'}}
              history={this.props.history}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

Timeline.propTypes = {
  history: PropTypes.object.isRequired,
  resource: PropTypes.shape({
    id: PropTypes.string.isRequired,
    resourceType: PropTypes.string.isRequired,
  }),
  onClick: PropTypes.func,
  baseUrl: PropTypes.string.isRequired,
  loadingMessage: PropTypes.string,
  setLoadingMessage: PropTypes.func.isRequired,
  dateFieldPath: PropTypes.func,
};

Timeline.defaultProps = {
  resource: {
    id: '',
    resourceType: '',
  },
  onClick: () => {},
  loadingMessage: '',
  dateFieldPath: () => {},
};

export default Timeline;
