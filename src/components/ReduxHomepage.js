import {connect} from 'react-redux';
import {
  setResources,
  setApi,
  setHomepageView,
  setLoadingMessage,
} from '../actions';
import {fetchAllResources, getResourceCount} from '../utils/api';
import {getBaseResourceCount} from '../utils/common';
import {acceptedResourceTypes} from '../config';
import Homepage from './Homepage';

const getAllResources = async (baseUrl, resourceType, dispatch) => {
  const url = `${baseUrl}${resourceType}`;
  let allResources = await fetchAllResources(url, []);
  dispatch(setLoadingMessage('Getting resource totals...'));
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
      let countUrl = `${baseUrl}${item.resource.type}`;
      countUrl =
        item.resource.type !== item.resource.name
          ? countUrl.concat(`?_profile:below=${item.resource.url}`)
          : countUrl;
      if (showResourceType(item.resource.type)) {
        return {
          id: item.resource.id,
          baseType: item.resource.type,
          name: item.resource.name,
          url: item.resource.url,
          count: await getResourceCount(countUrl),
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
  loadingMessage: state.resources.loadingMessage,
  serverOptions: state.user ? state.user.serverOptions : [],
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAllResources: async (baseUrl, resourceType) => {
      dispatch(setLoadingMessage('Fetching all resources...'));
      const allResources = await getAllResources(
        baseUrl,
        resourceType,
        dispatch,
      );
      dispatch(setResources(allResources));
    },
    setBaseUrl: url => dispatch(setApi(url)),
    setHomepageView: cardView => dispatch(setHomepageView(cardView)),
  };
};

const ReduxHomepage = connect(mapStateToProps, mapDispatchToProps)(Homepage);
export default ReduxHomepage;
