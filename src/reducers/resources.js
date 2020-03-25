import {
  SET_RESOURCES,
  SET_API,
  SET_HOMEPAGE_VIEW,
  SET_LOADING_MESSAGE,
} from '../actions';
import {defaultFhirServerUrl} from '../config';

const initialState = {
  baseUrl: process.env.REACT_APP_FHIR_API
    ? `${process.env.REACT_APP_FHIR_API}`
    : defaultFhirServerUrl,
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
    case SET_LOADING_MESSAGE:
      return {
        ...state,
        loadingMessage: action.loadingMessage,
      };
    default:
      return state;
  }
};

export default resources;
