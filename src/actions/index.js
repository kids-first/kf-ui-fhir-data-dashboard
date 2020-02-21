export const SET_RESOURCES = 'SET_RESOURCES';
export const SET_API = 'SET_API';
export const SET_ONTOLOGIES = 'SET_ONTOLOGIES';
export const SET_HOMEPAGE_VIEW = 'SET_HOMEPAGE_VIEW';
export const SET_LOADING_MESSAGE = 'SET_LOADING_MESSAGE';
export const SET_USER = 'SET_USER';

export const setResources = allResources => ({
  type: SET_RESOURCES,
  allResources,
});

export const setApi = baseUrl => ({
  type: SET_API,
  baseUrl,
});

export const setOntologies = ontologies => ({
  type: SET_ONTOLOGIES,
  ontologies,
});

export const setHomepageView = cardView => ({
  type: SET_HOMEPAGE_VIEW,
  cardView,
});

export const setLoadingMessage = loadingMessage => ({
  type: SET_LOADING_MESSAGE,
  loadingMessage,
});

export const setUser = (username, password) => {
  console.log('username', username);
  console.log('password', password);
  return {
    type: SET_USER,
    username,
    password,
  };
};
