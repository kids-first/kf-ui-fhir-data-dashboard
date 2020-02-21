import {SET_RESOURCES, SET_API, SET_HOMEPAGE_VIEW} from '../actions';

const initialState = {
  baseUrl: 'http://hapi.fhir.org/baseR4/',
  allResources: {},
  allResourcesFetched: false,
  cardView: true,
};

const resources = (state = initialState, action) => {
  switch (action.type) {
    case SET_RESOURCES:
      return {
        ...state,
        allResources: action.allResources,
        allResourcesFetched: true,
      };
    case SET_API:
      return {
        ...state,
        baseUrl: action.baseUrl,
        allResources: {},
        allResourcesFetched: false,
      };
    case SET_HOMEPAGE_VIEW:
      return {
        ...state,
        cardView: action.cardView,
      };
    default:
      return state;
  }
};

export default resources;
