import {getResourceCount, fetchAllResources} from './api';

export const getHumanReadableNumber = value =>
  value.toLocaleString(navigator.language, {minimumFractionDigits: 0});

export const getBaseResourceCount = async (baseUrl, baseType, resources) => {
  let sum = 0;
  let total = await getResourceCount(`${baseUrl}${baseType}`);
  console.log('total', total);
  console.log('baseUrl');
  const countedResources = new Set();
  if (!resources) {
    await fetchAllResources(`${baseUrl}StructureDefinition`, []).then(
      async data => {
        console.log('data', data);
        resources = await Promise.all(
          data
            .map(item => item.resource)
            .filter(resource => resource && resource.type === baseType)
            .map(async resource => {
              console.log('getting count for resource', resource.name);
              const count = await getResourceCount(
                `${baseUrl}${baseType}?_profile:below=${resource.url}`,
              );
              console.log('count', count);
              return {
                ...resource,
                count,
              };
            }),
        );
        console.log('resources', resources);
        resources.forEach(resource => {
          console.log('resource', resource);
          if (
            resource &&
            resource.type === baseType &&
            resource.name !== baseType &&
            !countedResources.has(resource.url)
          ) {
            console.log('adding resource', resource);
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
  console.log('sum', sum);
  return total - sum;
};
