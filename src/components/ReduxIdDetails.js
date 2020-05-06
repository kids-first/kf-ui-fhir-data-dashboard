import {connect} from 'react-redux';
import {fetchResource} from '../utils/api';
import {setLoadingMessage} from '../actions';
import IdDetails from './IdDetails';

const mapStateToProps = (state, ownProps) => {
  const resourceId = ownProps.match.params.resourceId;
  const id = ownProps.match.params.id;
  return {
    baseUrl: state.app.selectedServer.url,
    schemaUrl: `${state.app.selectedServer.url}StructureDefinition`,
    loadingMessage: state.app.loadingMessage,
    resourceId,
    id,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchResource: (url, abortController) =>
      fetchResource(url, abortController).catch(err => {
        throw err;
      }),
    setLoadingMessage: message => dispatch(setLoadingMessage(message)),
  };
};

const ReduxIdDetails = connect(mapStateToProps, mapDispatchToProps)(IdDetails);
export default ReduxIdDetails;
