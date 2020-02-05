import {connect} from 'react-redux';
import {setResources} from '../actions';
import {fetchAllResources, getResourceCount} from '../utils/api';
import {baseUrl, acceptedResourceTypes} from '../config';
import Homepage from './Homepage';

const getAllResources = async url => {
  let allResources = await fetchAllResources(url, []);
  allResources = allResources ? await setResourceCounts(allResources) : [];
  allResources = formatResources(allResources);
  return allResources;
};

const setResourceCounts = async items =>
  await Promise.all(
    items.map(async item => {
      if (showResourceType(item.resource.type)) {
        return {
          baseType: item.resource.type,
          name: item.resource.name,
          url: item.resource.url,
          count: await getResourceCount(`${baseUrl}${item.resource.type}`),
        };
      }
    }),
  );

const showResourceType = resourceType =>
  acceptedResourceTypes.includes(resourceType);

const formatResources = items => {
  let newItems = {};
  items.forEach(item => {
    if (item) {
      newItems[item.name] = {
        ...item,
      };
    }
  });
  return newItems;
};

const mapStateToProps = (state, ownProps) => ({
  allResources:
    state && state.resources && state.resources.allResources
      ? state.resources.allResources
      : {},
  allResourcesFetched:
    state && state.resources && state.resources.allResourcesFetched
      ? state.resources.allResourcesFetched
      : false,
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAllResources: async url => {
      const allResources = await getAllResources(url);
      dispatch(setResources(allResources));
    },
  };
};

const ReduxHomepage = connect(mapStateToProps, mapDispatchToProps)(Homepage);
export default ReduxHomepage;
