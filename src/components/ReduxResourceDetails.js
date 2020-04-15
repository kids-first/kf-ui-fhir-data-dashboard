import {connect} from 'react-redux';
import {
  getResourceCount,
  getSearchParams,
  fetchResource,
  getCapabilityStatementSearchParams,
} from '../utils/api';
import {setLoadingMessage} from '../actions';
import ResourceDetails from './ResourceDetails';

const mapStateToProps = (state, ownProps) => {
  const resourceId = ownProps.match.params.resourceId;
  const hasResources =
    state && state.resources && state.resources.allResourcesFetched;
  const resource = hasResources
    ? state.resources.allResources[resourceId]
    : {};
  return {
    total: resource.count ? resource.count : 0,
    resourceId,
    resourceFetched: hasResources,
    baseUrl: state.app.selectedServer.url,
    schemaUrl: `${state.app.selectedServer.url}StructureDefinition`,
    capabilityStatementUrl: `${state.app.selectedServer.url}metadata`,
    loadingMessage: state.app.loadingMessage,
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
