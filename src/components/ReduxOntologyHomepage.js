import {connect} from 'react-redux';
import {setOntologies, setApi, setLoadingMessage} from '../actions';
import {getOntologies, fetchResource} from '../utils/api';
import OntologyHomepage from './OntologyHomepage';

const groupOntologies = ontologies => {
  const groupedOntologies = {};
  ontologies.forEach(item => {
    if (!!item.name && !!item.url) {
      if (groupOntologies[item.name]) {
        groupedOntologies[item.name] = groupedOntologies[item.name].concat(
          item.url,
        );
      } else {
        groupedOntologies[item.name] = [item.url];
      }
    }
  });
  return groupedOntologies;
};

const mapStateToProps = (state, ownProps) => ({
  ontologies: state && state.ontologies ? state.ontologies.ontologies : [],
  ontologiesFetched:
    state && state.ontologies ? state.ontologies.ontologiesFetched : false,
  baseUrl: state.resources.baseUrl,
  loadingMessage: state.resources.loadingMessage,
  serverOptions: state.user ? state.user.serverOptions : [],
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setBaseUrl: url => dispatch(setApi(url)),
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
        .then(data => (data ? data.entry : null))
        .catch(err => {
          throw err;
        });
    },
  };
};

const ReduxOntologyHomepage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OntologyHomepage);
export default ReduxOntologyHomepage;
