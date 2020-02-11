import {connect} from 'react-redux';
import {
  getResourceCount,
  getSearchParams,
  fetchResource,
  getCapabilityStatement,
} from '../utils/api';
import queryString from 'query-string';
import ResourceDetails from './ResourceDetails';

const mapStateToProps = (state, ownProps) => {
  const resourceBaseType = ownProps.match.params.resourceBaseType;
  const queryValues = queryString.parse(ownProps.location.search);
  const resourceType = queryValues.name;
  const resourceUrl = queryValues.url;
  const hasResources =
    state && state.resources && state.resources.allResourcesFetched;
  const resource = hasResources
    ? state.resources.allResources[resourceType]
    : {};
  return {
    total: resource.count ? resource.count : 0,
    resourceBaseType,
    resourceType,
    resourceUrl,
    resourceFetched: hasResources,
    baseUrl: state.resources.baseUrl,
    schemaUrl: `${state.resources.baseUrl}StructureDefinition`,
    capabilityStatementUrl: `${state.resources.baseUrl}metadata`,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getCount: url => getResourceCount(url),
    getSearchParams: url => getSearchParams(url),
    getCapabilityStatement: (url, resourceType) =>
      getCapabilityStatement(url, resourceType),
    fetchResource: url => fetchResource(url),
  };
};

const ReduxResourceDetails = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ResourceDetails);
export default ReduxResourceDetails;
