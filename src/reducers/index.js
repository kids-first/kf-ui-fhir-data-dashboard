import {combineReducers} from 'redux';
import resources from './resources';
import ontologies from './ontologies';
import user from './user';

export default combineReducers({
  resources,
  ontologies,
  user,
});
