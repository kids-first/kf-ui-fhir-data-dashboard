import {connect} from 'react-redux';
import {setOntologies, setLoadingMessage} from '../actions';
import {getOntologies, fetchResource} from '../utils/api';
import {groupOntologies} from '../utils/common';
import OntologyHomepage from './OntologyHomepage';

const mapStateToProps = (state, ownProps) => ({
  ontologies: state && state.ontologies ? state.ontologies.ontologies : [],
  ontologiesFetched:
    state && state.ontologies ? state.ontologies.ontologiesFetched : false,
  baseUrl: state.app.selectedServer.url,
  loadingMessage: state.app.loadingMessage,
});

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
    getOntologyDetails: async (url, abortController) => {
      dispatch(setLoadingMessage('Fetching ontology details...'));
      return await fetchResource(url, abortController)
        .then(data => data)
        .catch(err => {
          throw err;
        });
    },
    setLoadingMessage: message => dispatch(setLoadingMessage(message)),
  };
};

const ReduxOntologyHomepage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OntologyHomepage);
export default ReduxOntologyHomepage;
