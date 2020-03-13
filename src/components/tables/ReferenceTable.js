import React from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'semantic-ui-react';
import {getReferencedBy, getReferences} from '../../utils/api';
import {logErrors} from '../../utils/common';
import SortableTable from './SortableTable';
import './ReferenceTable.css';

class ReferenceTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingReferences: false,
      referencingData: [],
      referencedByData: [],
      showChildModal: null,
      abortController: new AbortController(),
    };
  }

  componentDidMount() {
    this.fetchAllReferences();
  }

  componentDidUpdate(prevProps) {
    if (this.props.resource.resourceId !== prevProps.resource.resourceId) {
      this.fetchAllReferences();
    }
  }

  componentWillUnmount() {
    this.state.abortController.abort();
  }

  fetchAllReferences = async () => {
    this.setState({loadingReferences: true}, async () => {
      this.props.setLoadingMessage(
        `Fetching references for ${this.props.resource.id}...`,
      );
      await this.fetchReferencedBy()
        .then(async referencedByData => {
          await this.fetchReferencing()
            .then(referencingData => {
              this.setState({
                referencedByData,
                referencingData,
                loadingReferences: false,
              });
            })
            .catch(err => logErrors('Error getting references:', err));
        })
        .catch(err =>
          logErrors('Error getting resources that reference ID:', err),
        );
    });
  };

  fetchReferencedBy = async () => {
    return await getReferencedBy(
      this.props.baseUrl,
      this.props.resource.resourceType,
      this.props.resource.id,
      this.state.abortController,
    )
      .then(references => this.getReferenceMap(references))
      .catch(err => {
        throw err;
      });
  };

  fetchReferencing = async () => {
    const referencingIds = Object.keys(this.props.resource)
      .map(field => this.props.resource[field].reference)
      .filter(field => field);
    return await getReferences(
      this.props.baseUrl,
      referencingIds,
      this.state.abortController,
    )
      .then(allReferences => this.getReferenceMap(allReferences))
      .catch(err => {
        throw err;
      });
  };

  getReferenceMap = references => {
    let uniqueReferences = {};
    references.forEach(reference => {
      const mapValue = uniqueReferences[reference.profile];
      if (!!mapValue) {
        uniqueReferences[reference.profile] = {
          ...mapValue,
          total: mapValue.total + 1,
          children: mapValue.children.concat(reference),
        };
      } else {
        uniqueReferences[reference.profile] = {
          id: `${reference.resourceType}-${reference.name}`,
          resourceType: reference.resourceType,
          name: reference.name,
          profile: reference.profile,
          total: 1,
          children: [reference],
        };
      }
    });
    return Object.values(uniqueReferences);
  };

  onChildRowClick = child => {
    this.setState({showChildModal: child});
  };

  closeModal = () => {
    this.setState({showChildModal: null});
  };

  render() {
    return (
      <div className="reference-table">
        <div
          className={`ui ${
            this.state.loadingReferences ? 'active' : 'disabled'
          } loader`}
        >
          <p>{this.props.loadingMessage}</p>
        </div>
        {(this.state.referencedByData || this.state.referencingData) &&
        !this.state.loadingReferences ? (
          <div>
            <h3>Resources that reference {this.props.resource.id}:</h3>
            <SortableTable
              headerCells={this.props.tableHeaders}
              data={this.state.referencedByData}
              rowChildren={true}
              onChildRowClick={this.onChildRowClick}
            />
            <h3>Resources referenced by {this.props.resource.id}:</h3>
            <SortableTable
              headerCells={this.props.tableHeaders}
              data={this.state.referencingData}
              rowChildren={true}
              onChildRowClick={this.onChildRowClick}
            />
            <Modal
              open={!!this.state.showChildModal}
              onClose={() => this.closeModal()}
              dimmer="inverted"
            >
              <Modal.Header>
                {this.state.showChildModal
                  ? this.state.showChildModal.id
                  : null}
              </Modal.Header>
              <Modal.Content>
                <Modal.Description>
                  <pre>
                    {JSON.stringify(this.state.showChildModal, null, 2)}
                  </pre>
                </Modal.Description>
              </Modal.Content>
            </Modal>
          </div>
        ) : null}
      </div>
    );
  }
}

ReferenceTable.propTypes = {
  resource: PropTypes.shape({
    id: PropTypes.string.isRequired,
    resourceType: PropTypes.string.isRequired,
  }),
  tableHeaders: PropTypes.arrayOf(
    PropTypes.shape({
      display: PropTypes.string.isRequired,
      sortId: PropTypes.string.isRequired,
      func: PropTypes.func,
    }),
  ),
  onClick: PropTypes.func,
  baseUrl: PropTypes.string.isRequired,
  loadingMessage: PropTypes.string,
  setLoadingMessage: PropTypes.func.isRequired,
};

ReferenceTable.defaultProps = {
  resource: {
    id: '',
    resourceType: '',
  },
  onClick: () => {},
  loadingMessage: '',
};

export default ReferenceTable;
