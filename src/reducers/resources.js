import {
  SET_RESOURCES,
  SET_API,
  SET_HOMEPAGE_VIEW,
  SET_LOADING_MESSAGE,
  CLEAR_USER,
} from '../actions';
import {getBaseUrl} from '../config';

const initialState = {
  baseUrl: getBaseUrl(),
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
    case CLEAR_USER:
      const {baseUrl} = state;
      return {
        ...initialState,
        baseUrl,
      };
    default:
      return state;
  }
};

export default resources;
