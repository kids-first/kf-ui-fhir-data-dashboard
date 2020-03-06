import {getResourceCount, fetchAllResources} from './api';

export const getHumanReadableNumber = value =>
  value.toLocaleString(navigator.language, {minimumFractionDigits: 0});

export const getDropdownOptions = servers =>
  servers.map(server => ({
    key: server.name,
    text: server.name,
    value: server.url,
  }));

export const getBaseResourceCount = async (baseUrl, baseType, resources) => {
  let sum = 0;
  let total = await getResourceCount(`${baseUrl}${baseType}`);
  const countedResources = new Set();
  if (!resources) {
    await fetchAllResources(`${baseUrl}StructureDefinition`, []).then(
      async data => {
        resources = await Promise.all(
          data
            .map(item => item.resource)
            .filter(resource => resource && resource.type === baseType)
            .map(async resource => {
              const count = await getResourceCount(
                `${baseUrl}${baseType}?_profile:below=${resource.url}`,
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
      },
    );
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
