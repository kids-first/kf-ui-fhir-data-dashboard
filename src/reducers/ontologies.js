import {SET_ONTOLOGIES} from '../actions';

const initialState = {
  ontologies: {},
  ontologiesFetched: false,
};

const ontologies = (state = {}, action) => {
  switch (action.type) {
    case SET_ONTOLOGIES:
      return {
        ...state,
        ontologies: action.ontologies,
        ontologiesFetched: true,
      };
    default:
      return initialState;
  }
};

export default ontologies;
