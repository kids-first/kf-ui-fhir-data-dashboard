import {connect} from 'react-redux';
import {setOntologies, setApi} from '../actions';
import {getOntologies} from '../utils/api';
import OntologyHomepage from './OntologyHomepage';

const mapStateToProps = (state, ownProps) => ({
  ontologies: state && state.ontologies ? state.ontologies.ontologies : [],
  ontologiesFetched:
    state && state.ontologies ? state.ontologies.ontologiesFetched : false,
  baseUrl: state.resources.baseUrl,
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setBaseUrl: url => dispatch(setApi(url)),
    getOntologies: async url => {
      const ontologies = await getOntologies(url);
      dispatch(setOntologies(ontologies));
    },
  };
};

const ReduxOntologyHomepage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OntologyHomepage);
export default ReduxOntologyHomepage;
