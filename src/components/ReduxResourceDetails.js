import {connect} from 'react-redux';
import {getResourceCount} from '../utils/api';
import ResourceDetails from './ResourceDetails';

const mapStateToProps = (state, ownProps) => {
  const resourceType = ownProps.match.params.resourceType;
  const hasResources =
    state && state.resources && state.resources.allResourcesFetched;
  const results = hasResources
    ? state.resources.allResources[resourceType]
    : {};
  return {
    total: results.count ? results.count : 0,
    resourceType,
    resultsFetched: hasResources,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getCount: url => getResourceCount(url).then(data => data),
  };
};

const ReduxResourceDetails = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ResourceDetails);
export default ReduxResourceDetails;
