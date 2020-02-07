import {SET_RESOURCES} from '../actions';

const initialState = {
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
    default:
      return initialState;
  }
};

export default resources;
