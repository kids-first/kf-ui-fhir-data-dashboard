import {connect} from 'react-redux';
import {
  getResourceCount,
  getSearchParams,
  fetchResource,
  getCapabilityStatementSearchParams,
} from '../utils/api';
import {setLoadingMessage} from '../actions';
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
    loadingMessage: state.resources.loadingMessage,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getCount: (url, abortController) =>
      getResourceCount(url, abortController).catch(err => {
        throw err;
      }),
    getSearchParams: (url, abortController) =>
      getSearchParams(url, abortController).catch(err => {
        throw err;
      }),
    getCapabilityStatement: (url, resourceType, abortController) =>
      getCapabilityStatementSearchParams(
        url,
        resourceType,
        abortController,
      ).catch(err => {
        throw err;
      }),
    fetchResource: (url, abortController) =>
      fetchResource(url, abortController).catch(err => {
        throw err;
      }),
    setLoadingMessage: message => dispatch(setLoadingMessage(message)),
  };
};

const ReduxResourceDetails = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ResourceDetails);
export default ReduxResourceDetails;
