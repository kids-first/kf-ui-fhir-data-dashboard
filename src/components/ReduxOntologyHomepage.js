import {connect} from 'react-redux';
import {setOntologies, setLoadingMessage} from '../actions';
import {getOntologies, fetchResource} from '../utils/api';
import OntologyHomepage from './OntologyHomepage';

const groupOntologies = ontologies => {
  const groupedOntologies = {};
  ontologies.forEach(item => {
    if (!!item.id && !!item.url) {
      if (groupedOntologies[item.id]) {
        groupedOntologies[item.id] = {
          url: groupedOntologies[item.id].concat(item.url),
          ...groupedOntologies[item.id],
        };
      } else {
        groupedOntologies[item.id] = {
          url: [item.url],
          name: item.name,
        };
      }
    }
  });
  return groupedOntologies;
};

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
