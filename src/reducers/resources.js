import {SET_RESOURCES, SET_API} from '../actions';

const initialState = {
  baseUrl: process.env.REACT_APP_FHIR_API
    ? `${process.env.REACT_APP_FHIR_API}`
    : 'http://10.10.1.191:8000/',
  allResources: {},
  allResourcesFetched: false,
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
    default:
      return state;
  }
};

export default resources;
