import {getResourceCount} from './api';

export const getHumanReadableNumber = value =>
  value.toLocaleString(navigator.language, {minimumFractionDigits: 0});

export const getBaseResourceCount = async (baseUrl, baseType, resources) => {
  let sum = 0;
  let total = await getResourceCount(`${baseUrl}${baseType}`);
  Object.keys(resources).forEach(key => {
    if (key && resources[key] && resources[key].baseType === baseType) {
      sum += resources[key].count;
    }
  });
  return total - sum;
};
