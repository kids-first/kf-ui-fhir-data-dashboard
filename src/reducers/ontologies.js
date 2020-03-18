import {SET_ONTOLOGIES, SET_API} from '../actions';

const initialState = {
  ontologies: {},
  ontologiesFetched: false,
};

const ontologies = (state = initialState, action) => {
  switch (action.type) {
    case SET_ONTOLOGIES:
      return {
        ...state,
        ontologies: action.ontologies,
        ontologiesFetched: true,
      };
    case SET_API:
      return {
        ...state,
        ontologies: {},
        ontologiesFetched: false,
      };
    default:
      return state;
  }
};

export default ontologies;
