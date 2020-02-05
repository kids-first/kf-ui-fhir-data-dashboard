import {SET_RESOURCES} from '../actions';

const resources = (state = {}, action) => {
  switch (action.type) {
    case SET_RESOURCES:
      return {
        ...state,
        allResources: action.allResources,
        allResourcesFetched: true,
      };
    default:
      return state;
  }
};

export default resources;
