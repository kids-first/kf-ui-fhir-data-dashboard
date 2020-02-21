import {SET_USER} from '../actions';

const user = (state = {}, action) => {
  switch (action.type) {
    case SET_USER:
      const token = btoa(`${action.username}:${action.password}`);
      sessionStorage.setItem('token', token);
      return {
        ...state,
        token,
        username: action.username,
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
