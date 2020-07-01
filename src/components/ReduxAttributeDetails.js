import {connect} from 'react-redux';
import {
  fetchResource,
  fetchAllResources,
  getCapabilityStatementReferences,
} from '../utils/api';
import {setLoadingMessage} from '../actions';
import AttributeDetails from './AttributeDetails';

const mapStateToProps = (state, ownProps) => {
  const resourceId = ownProps.match.params.resourceId;
  const query = ownProps.match.params.query;
  return {
    baseUrl: state.app.selectedServer.url,
    schemaUrl: `${state.app.selectedServer.url}StructureDefinition`,
    loadingMessage: state.app.loadingMessage,
    resourceId,
    query,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchResource: (url, abortController) =>
      fetchResource(url, abortController).catch(err => {
        throw err;
      }),
    fetchAllResources: (url, abortController) =>
      fetchAllResources(url, [], abortController).catch(err => {
        throw err;
      }),
    getCapabilityStatementReferences: (url, resourceType, abortController) =>
      getCapabilityStatementReferences(
        url,
        resourceType,
        abortController,
      ).catch(err => {
        throw err;
      }),
    setLoadingMessage: message => dispatch(setLoadingMessage(message)),
  };
};

const ReduxAttributeDetails = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AttributeDetails);
export default ReduxAttributeDetails;
