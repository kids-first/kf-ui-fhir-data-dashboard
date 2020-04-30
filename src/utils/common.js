import {getResourceCount, fetchAllResources} from './api';
import store from '../store';

export const getHumanReadableNumber = value =>
  value.toLocaleString(navigator.language, {minimumFractionDigits: 0});

export const getBaseResourceCount = async (
  baseUrl,
  baseType,
  resources,
  abortController,
) => {
  let sum = 0;
  let total = await getResourceCount(`${baseUrl}${baseType}`, abortController);
  const countedResources = new Set();
  if (!resources) {
    await fetchAllResources(
      `${baseUrl}StructureDefinition`,
      [],
      abortController,
    ).then(async data => {
      resources = await Promise.all(
        data
          .map(item => item.resource)
          .filter(resource => resource && resource.type === baseType)
          .map(async resource => {
            const count = await getResourceCount(
              `${baseUrl}${baseType}?_profile:below=${resource.url}`,
              abortController,
            );
            return {
              ...resource,
              count,
            };
          }),
      );
      resources.forEach(resource => {
        if (
          resource &&
          resource.type === baseType &&
          resource.name !== baseType &&
          !countedResources.has(resource.url)
        ) {
          countedResources.add(resource.url);
          sum += resource.count;
        }
      });
    });
  } else {
    Object.keys(resources).forEach(key => {
      if (
        key &&
        resources[key] &&
        resources[key].baseType === baseType &&
        resources[key].name !== baseType &&
        !countedResources.has(resources[key].url)
      ) {
        countedResources.add(resources[key].url);
        sum += resources[key].count;
      }
    });
  }
  return total - sum;
};

export const logErrors = (msg, error) => {
  console.log(msg, error);
};

export const replaceLocalhost = url => {
  const baseUrl = store.getState().app.selectedServer.url;
  let splitUrl = baseUrl.split(':');
  if (splitUrl.length > 1) {
    splitUrl = splitUrl[1];
  } else {
    splitUrl = splitUrl[0];
  }
  return url.replace('localhost', splitUrl);
};

export const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
