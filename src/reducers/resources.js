import {SET_RESOURCES, SET_API} from '../actions';

const initialState = {
  baseUrl: 'http://hapi.fhir.org/baseR4/',
  allResources: {},
  allResourcesFetched: false,
};

const resources = (state = {}, action) => {
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
    default:
      return initialState;
  }
};

export default resources;
