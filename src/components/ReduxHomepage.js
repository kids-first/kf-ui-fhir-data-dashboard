import {connect} from 'react-redux';
import {setResources, setApi, setHomepageView} from '../actions';
import {fetchAllResources, getResourceCount} from '../utils/api';
import {getBaseResourceCount} from '../utils/common';
import {acceptedResourceTypes} from '../config';
import Homepage from './Homepage';

const getAllResources = async (baseUrl, resourceType) => {
  const url = `${baseUrl}${resourceType}`;
  let allResources = await fetchAllResources(url, []);
  allResources = allResources
    ? await setResourceCounts(baseUrl, allResources)
    : [];
  allResources = await Promise.all(
    allResources.map(async resource => {
      if (resource && resource.baseType === resource.name) {
        return {
          ...resource,
          count: await getBaseResourceCount(
            baseUrl,
            resource.baseType,
            allResources,
          ),
        };
      }
      return resource;
    }),
  );
  allResources = formatResources(allResources);
  return allResources;
};

const setResourceCounts = async (baseUrl, items) =>
  await Promise.all(
    items.map(async item => {
      if (showResourceType(item.resource.type)) {
        return {
          baseType: item.resource.type,
          name: item.resource.name,
          url: item.resource.url,
          count: await getResourceCount(
            `${baseUrl}${item.resource.type}?_profile:below=${item.resource.url}`,
          ),
        };
      }
    }),
  );

const showResourceType = resourceType =>
  acceptedResourceTypes.has(resourceType);

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
  allResources: state && state.resources ? state.resources.allResources : {},
  allResourcesFetched:
    state && state.resources ? state.resources.allResourcesFetched : false,
  baseUrl: state.resources.baseUrl,
  cardView: state.resources.cardView,
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAllResources: async (baseUrl, resourceType) => {
      const allResources = await getAllResources(baseUrl, resourceType);
      dispatch(setResources(allResources));
    },
    setBaseUrl: url => dispatch(setApi(url)),
    setHomepageView: cardView => dispatch(setHomepageView(cardView)),
  };
};

const ReduxHomepage = connect(mapStateToProps, mapDispatchToProps)(Homepage);
export default ReduxHomepage;
