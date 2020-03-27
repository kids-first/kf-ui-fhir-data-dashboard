import {SET_USER, ADD_SERVER, UPDATE_SERVER, CLEAR_USER} from '../actions';
import {defaultFhirServers} from '../config';

const initialState = {
  serverOptions: defaultFhirServers,
};

const app = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      const token = btoa(`${action.username}:${action.password}`);
      sessionStorage.setItem('token', token);
      return {
        ...state,
        token,
        username: action.username,
      };
    case CLEAR_USER:
      return {
        ...initialState,
        serverOptions: [...state.serverOptions],
      };
    case ADD_SERVER:
      const currentOptions = [...state.serverOptions];
      return {
        ...state,
        serverOptions: currentOptions.concat({
          id: action.id,
          name: action.name,
          url:
            action.url.substring(action.url.length - 1, action.url.length) ===
            '/'
              ? action.url
              : action.url.concat('/'),
          authRequired: action.authRequired,
        }),
      };
    case UPDATE_SERVER:
      let serverOptions = [...state.serverOptions];
      const updatedServerIndex = serverOptions.findIndex(
        server => server.id === action.id,
      );
      serverOptions[updatedServerIndex] = {
        id: action.id,
        name: action.name,
        url:
          action.url.substring(action.url.length - 1, action.url.length) === '/'
            ? action.url
            : action.url.concat('/'),
        authRequired: action.authRequired,
      };
      return {
        ...state,
        serverOptions,
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

export default app;
