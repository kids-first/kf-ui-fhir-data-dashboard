import {combineReducers} from 'redux';
import resources from './resources';
import ontologies from './ontologies';

export default combineReducers({
  resources,
  ontologies,
});
