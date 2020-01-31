import {connect} from 'react-redux';
import {setResources} from '../actions';
import {fetchAllResources, getResourceCount} from '../utils/api';
import {baseUrl, resourceCategories} from '../config';
import AllResources from './AllResources';

const fetchResources = async url => {
  let results = await fetchAllResources(url, []);
  results = results ? await setResourceCounts(results) : [];
  results = formatResults(results);
  return results;
};

const setResourceCounts = async results =>
  await Promise.all(
    results.map(async result => {
      if (showResourceType(result.resource.type)) {
        return {
          baseType: result.resource.type,
          name: result.resource.name,
          count: await getResourceCount(`${baseUrl}${result.resource.type}`),
        };
      }
    }),
  );

const showResourceType = resourceType => {
  let showResource = false;
  Object.keys(resourceCategories).forEach(category => {
    Object.keys(resourceCategories[category]).forEach(subCategory => {
      if (resourceCategories[category][subCategory].includes(resourceType)) {
        showResource = true;
      }
    });
  });
  return showResource;
};

const formatResults = results => {
  let newResults = {};
  results.forEach(result => {
    if (result) {
      newResults[result.name] = {
        ...result,
      };
    }
  });
  return newResults;
};

const mapStateToProps = (state, ownProps) => {
  console.log('state', state);
  return {
    resources:
      state && state.resources && state.resources.allResources
        ? state.resources.allResources
        : {},
    allResourcesFetched:
      state && state.resources && state.resources.allResourcesFetched
        ? state.resources.allResourcesFetched
        : false,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAllResources: async url => {
      console.log('in props func');
      const results = await fetchResources(url);
      dispatch(setResources(results));
    },
  };
};

const ReduxAllResources = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AllResources);
export default ReduxAllResources;
