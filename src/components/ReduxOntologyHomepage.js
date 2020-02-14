import {connect} from 'react-redux';
import {setOntologies, setApi} from '../actions';
import {getOntologies} from '../utils/api';
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
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setBaseUrl: url => dispatch(setApi(url)),
    getOntologies: async url => {
      const ontologies = await getOntologies(url);
      const groupedOntologies = groupOntologies(ontologies);
      dispatch(setOntologies(groupedOntologies));
    },
  };
};

const ReduxOntologyHomepage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OntologyHomepage);
export default ReduxOntologyHomepage;
