import {combineReducers} from 'redux';
import {CLEAR_USER, SET_USER, SET_API} from '../actions';
import resources from './resources';
import ontologies from './ontologies';
import app from './app';

const appReducer = combineReducers({
  resources,
  ontologies,
  app,
});

const rootReducer = (state, action) => {
  if (
    action.type === CLEAR_USER ||
    action.type === SET_USER ||
    action.type === SET_API
  ) {
    sessionStorage.removeItem('token');
  }
  return appReducer(state, action);
};

export default rootReducer;
