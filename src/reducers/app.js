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
    url: initialServer.url,
    authType: initialServer.authType,
    authUrl: initialServer.authUrl,
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
      let {baseUrl, serverOptions, authType} = state;
      return {
        ...initialState,
        baseUrl,
        authType,
        serverOptions,
      };
    case SET_API:
      const selectedServer = state.serverOptions.find(
        server => server.url === action.baseUrl,
      );
      return {
        ...state,
        baseUrl: action.baseUrl,
        authType: selectedServer.authType,
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
      serverOptions = [...state.serverOptions];
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
