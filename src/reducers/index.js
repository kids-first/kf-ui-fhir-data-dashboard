import {combineReducers} from 'redux';
import {CLEAR_USER, SET_USER} from '../actions';
import resources from './resources';
import ontologies from './ontologies';
import user from './user';

const appReducer = combineReducers({
  resources,
  ontologies,
  user,
});

const rootReducer = (state, action) => {
  if (action.type === CLEAR_USER || action.type === SET_USER) {
    sessionStorage.removeItem('token');
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
