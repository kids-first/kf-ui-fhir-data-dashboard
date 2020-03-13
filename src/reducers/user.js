import {SET_USER, ADD_SERVER} from '../actions';
import {defaultFhirServers} from '../config';

const initialState = {
  serverOptions: defaultFhirServers,
};

const user = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      const token = btoa(`${action.username}:${action.password}`);
      sessionStorage.setItem('token', token);
      return {
        ...state,
        token,
        username: action.username,
      };
    case ADD_SERVER:
      const currentOptions = state.serverOptions;
      return {
        ...state,
        serverOptions: currentOptions.concat({
          name: action.url,
          url: action.url,
          authRequired: false,
        }),
      };
    default:
      return {
        ...state,
        token: sessionStorage.getItem('token'),
        username: sessionStorage.getItem('token')
          ? atob(sessionStorage.getItem('token')).split(':')[0]
          : null,
      };
  }
};

export default user;
