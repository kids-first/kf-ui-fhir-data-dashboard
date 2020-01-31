import {SET_RESOURCES} from '../actions';

const resources = (state = {}, action) => {
  switch (action.type) {
    case SET_RESOURCES:
      return {
        ...state,
        allResources: action.resources,
        allResourcesFetched: true,
      };
    default:
      return state;
  }
};

export default resources;
