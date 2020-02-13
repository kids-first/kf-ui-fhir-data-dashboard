export const SET_RESOURCES = 'SET_RESOURCES';
export const SET_API = 'SET_API';

export const setResources = allResources => ({
  type: SET_RESOURCES,
  allResources,
});

export const setApi = baseUrl => ({
  type: SET_API,
  baseUrl,
});
