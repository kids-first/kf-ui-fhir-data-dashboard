import {connect} from 'react-redux';
import {setResources, setHomepageView, setLoadingMessage} from '../actions';
import {fetchAllResources, getResourceCount} from '../utils/api';
import {getBaseResourceCount} from '../utils/common';
import {acceptedResourceTypes, resourceCategories} from '../config';
import Homepage from './Homepage';

let sortedResources = [];

const getAllResources = async (
  baseUrl,
  resourceType,
  abortController,
  dispatch,
) => {
  const url = `${baseUrl}${resourceType}`;
  dispatch(setLoadingMessage('Getting resource totals...'));
  return await fetchAllResources(url, [], abortController)
    .then(async allResources => {
      allResources = allResources
        ? await setResourceCounts(baseUrl, allResources, abortController)
        : [];
      return await Promise.all(
        allResources.map(async resource => {
          if (resource && resource.baseType === resource.name) {
            return {
              ...resource,
              count: await getBaseResourceCount(
                baseUrl,
                resource.baseType,
                allResources,
                abortController,
              ),
            };
          }
          return resource;
        }),
      )
        .then(allResources => {
          sortedResources = sortResources(allResources);
          allResources = formatResources(allResources);
          return allResources;
        })
        .catch(err => {
          throw err;
        });
    })
    .catch(err => {
      throw err;
    });
};

const setResourceCounts = async (baseUrl, items, abortController) =>
  await Promise.all(
    items.map(async item => {
      let countUrl = `${baseUrl}${item.resource.type}`;
      countUrl =
        item.resource.type !== item.resource.name
          ? countUrl.concat(`?_profile:below=${item.resource.url}`)
          : countUrl;
      if (showResourceType(item.resource.type)) {
        return await getResourceCount(countUrl, abortController)
          .then(count => {
            return {
              id: item.resource.id,
              baseType: item.resource.type,
              name: item.resource.name,
              url: item.resource.url,
              count,
            };
          })
          .catch(err => {
            throw err;
          });
      }
    }),
  );

const sortResources = resources =>
  resources.sort((a, b) => (a.count > b.count ? -1 : 1)).filter(x => x);

const formatResources = items => {
  let newItems = {};
  items.forEach(item => {
    if (item) {
      const baseType = item.baseType;
      const module = resourceCategories[baseType][0];
      const category = resourceCategories[baseType][1];
      newItems[item.id] = {
        ...item,
        module,
        category,
      };
    }
  });
  return newItems;
};

const showResourceType = resourceType =>
  acceptedResourceTypes.has(resourceType);

const mapStateToProps = (state, ownProps) => ({
  allResources: state && state.resources ? state.resources.allResources : {},
  allResourcesFetched:
    state && state.resources ? state.resources.allResourcesFetched : false,
  baseUrl:
    state.app && state.app.selectedServer ? state.app.selectedServer.url : '',
  cardView: state.resources.cardView,
  loadingMessage: state.app.loadingMessage,
  sortedResources: sortedResources,
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAllResources: async (baseUrl, resourceType, abortController) => {
      dispatch(setLoadingMessage('Fetching all resources...'));
      await getAllResources(baseUrl, resourceType, abortController, dispatch)
        .then(allResources => {
          dispatch(setResources(allResources));
        })
        .catch(err => {
          throw err;
        });
    },
    setHomepageView: cardView => dispatch(setHomepageView(cardView)),
    setLoadingMessage: message => dispatch(setLoadingMessage(message)),
  };
};

const ReduxHomepage = connect(mapStateToProps, mapDispatchToProps)(Homepage);
export default ReduxHomepage;
