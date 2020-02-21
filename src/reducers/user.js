import {SET_USER} from '../actions';

const initialState = {
  token: null,
};

const user = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        token: btoa(`${action.username}:${action.password}`),
      };
    default:
      return state;
  }
};

export default user;
