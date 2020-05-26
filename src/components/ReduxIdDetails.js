import {connect} from 'react-redux';
import {fetchResource, fetchAllResources, getOntologies} from '../utils/api';
import {groupOntologies} from '../utils/common';
import {setLoadingMessage, setOntologies} from '../actions';
import IdDetails from './IdDetails';

const mapStateToProps = (state, ownProps) => {
  const resourceId = ownProps.match.params.resourceId;
  const id = ownProps.match.params.id;
  return {
    baseUrl: state.app.selectedServer.url,
    schemaUrl: `${state.app.selectedServer.url}StructureDefinition`,
    loadingMessage: state.app.loadingMessage,
    resourceId,
    id,
    ontologies: state.ontologies.ontologies,
    ontologiesFetched: state.ontologies.ontologiesFetched,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getOntologies: async (url, abortController) => {
      dispatch(setLoadingMessage('Fetching all ontologies...'));
      await getOntologies(url, abortController)
        .then(ontologies => {
          const groupedOntologies = groupOntologies(ontologies);
          dispatch(setOntologies(groupedOntologies));
        })
        .catch(err => {
          throw err;
        });
    },
    fetchResource: (url, abortController) =>
      fetchResource(url, abortController).catch(err => {
        throw err;
      }),
    fetchAllResources: (url, abortController) =>
      fetchAllResources(url, [], abortController)
        .then(data => data)
        .catch(err => {
          throw err;
        }),
    setLoadingMessage: message => dispatch(setLoadingMessage(message)),
  };
};

const ReduxIdDetails = connect(mapStateToProps, mapDispatchToProps)(IdDetails);
export default ReduxIdDetails;
