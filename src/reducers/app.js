import {
  SET_USER,
  ADD_SERVER,
  UPDATE_SERVER,
  CLEAR_USER,
  SET_API,
  SET_LOADING_MESSAGE,
} from '../actions';
import {defaultFhirServers, getBaseUrl} from '../config';

const initialServer = defaultFhirServers.find(
  server => server.url === getBaseUrl(),
);
const initialState = {
  selectedServer: {
    ...initialServer,
  },
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
      let {serverOptions, selectedServer} = state;
      return {
        ...initialState,
        selectedServer,
        serverOptions,
      };
    case SET_API:
      const newSelectedServer = state.serverOptions.find(
        server => server.url === action.baseUrl,
      );
      return {
        ...state,
        selectedServer: newSelectedServer,
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
          authType: action.authType,
        }),
      };
    case UPDATE_SERVER:
      let newServerOptions = [...state.serverOptions];
      const updatedServerIndex = newServerOptions.findIndex(
        server => server.id === action.id,
      );
      newServerOptions[updatedServerIndex] = {
        id: action.id,
        name: action.name,
        url:
          action.url.substring(action.url.length - 1, action.url.length) === '/'
            ? action.url
            : action.url.concat('/'),
        authType: action.authType,
      };
      const currentServer = newServerOptions.find(
        x => x.id === state.selectedServer.id,
      );
      return {
        ...state,
        serverOptions: newServerOptions,
        selectedServer: currentServer,
      };
    case SET_LOADING_MESSAGE:
      return {
        ...state,
        loadingMessage: action.loadingMessage,
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
