import React from 'react';
import PropTypes from 'prop-types';
import {getReferencedBy, getReferences} from '../../utils/api';
import {logErrors} from '../../utils/common';

class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingReferences: false,
      referencingData: [],
      referencedByData: [],
      filteredReferencingData: [],
      filteredReferencedByData: [],
      referencingChildRowOpen: -1,
      referencedByChildRowOpen: -1,
      dates: [],
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
    this.setState({loadingReferences: true}, async () => {
      this.props.setLoadingMessage(
        `Fetching references for ${this.props.resource.id}...`,
      );
      await this.fetchReferencedBy()
        .then(async referencedByData => {
          await this.fetchReferencing()
            .then(referencingData => {
              console.log('referencingData', referencedByData);
              const dates = this.getDates(referencedByData);
              console.log('dates', dates);
              this.setState({
                referencedByData,
                referencingData,
                loadingReferences: false,
                filteredReferencingData: referencingData,
                filteredReferencedByData: referencedByData,
                dates,
              });
            })
            .catch(err => logErrors('Error getting references:', err));
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

  fetchReferencing = async () => {
    const referencingIds = Object.keys(this.props.resource)
      .map(field => this.props.resource[field].reference)
      .filter(field => field);
    return await getReferences(
      this.props.baseUrl,
      referencingIds,
      this.state.abortController,
    )
      .then(allReferences => this.getReferenceMap(allReferences))
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

  getDates = data => {
    let dates = [];
    data.forEach(resource => {
      resource.children.forEach(child => {
        const date = this.props.dateFieldPath(child);
        if (date) {
          dates.push(date);
        }
      });
    });
    return dates.sort();
  };

  render() {
    return (
      <div className="reference-table">
        <div
          className={`ui ${
            this.state.loadingReferences ? 'active' : 'disabled'
          } loader`}
        >
          <p>{this.props.loadingMessage}</p>
        </div>
        {(this.state.filteredReferencedByData ||
          this.state.filteredReferencingData) &&
        !this.state.loadingReferences ? (
          <div></div>
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
