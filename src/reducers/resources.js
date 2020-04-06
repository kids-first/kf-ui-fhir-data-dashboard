import {
  SET_RESOURCES,
  SET_API,
  SET_HOMEPAGE_VIEW,
  CLEAR_USER,
} from '../actions';

const initialState = {
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
        allResources: {},
        allResourcesFetched: false,
      };
    case SET_HOMEPAGE_VIEW:
      return {
        ...state,
        cardView: action.cardView,
      };
    case CLEAR_USER:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export default resources;
