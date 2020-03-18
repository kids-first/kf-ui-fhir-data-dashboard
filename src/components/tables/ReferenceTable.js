import React from 'react';
import PropTypes from 'prop-types';
import {Modal} from 'semantic-ui-react';
import ReactJson from 'react-json-view';
import {getReferencedBy, getReferences} from '../../utils/api';
import SortableTable from './SortableTable';
import './ReferenceTable.css';

class ReferenceTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingReferences: false,
      referencingData: [],
      referencedByData: [],
      filteredReferencingData: [],
      filteredReferencedByData: [],
      showChildModal: null,
      referencingChildRowOpen: -1,
      referencedByChildRowOpen: -1,
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
                filteredReferencingData: referencingData,
                filteredReferencedByData: referencedByData,
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
    const references = await getReferencedBy(
      this.props.baseUrl,
      this.props.resource.resourceType,
      this.props.resource.id,
    );
    return this.getReferenceMap(references);
  };

  fetchReferencing = async () => {
    const referencingIds = Object.keys(this.props.resource)
      .map(field => this.props.resource[field].reference)
      .filter(field => field);
    const allReferences = await getReferences(
      this.props.baseUrl,
      referencingIds,
    );
    return this.getReferenceMap(allReferences);
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

  handleResultSelect = (searchResults, referenceType) => {
    const referenceData =
      referenceType === 'referencing'
        ? this.state.referencingData
        : this.state.referencedByData;
    console.log('referenceData', referenceData);
    let parentIndex = -1;
    let childIndex = -1;
    if (searchResults.length === 1) {
      referenceData.forEach((resource, i) => {
        resource.children.forEach((child, j) => {
          if (child.id === searchResults[0].title) {
            childIndex = j;
            parentIndex = i;
          }
        });
      });
    }
    let filteredData = referenceData;
    console.log('initial filteredData', filteredData);
    if (parentIndex > -1 && childIndex > -1) {
      filteredData[parentIndex] = {
        ...referenceData[parentIndex],
        children: [referenceData[parentIndex].children[childIndex]],
      };
    }
    console.log('filteredData', filteredData);
    // if (referenceType === 'referencing') {
    //   this.setState({
    //     filteredReferencingData: filteredData,
    //     referencingChildRowOpen: parentIndex,
    //   });
    // } else {
    //   this.setState({
    //     filteredReferencedByData: filteredData,
    //     referencedByChildRowOpen: parentIndex,
    //   });
    // }
  };

  render() {
    console.log('this.state', this.state);
    return (
      <div className="reference-table">
        <div
          className={`ui ${
            this.state.loadingReferences ? 'active' : 'disabled'
          } loader`}
        >
          <p>{this.props.loadingMessage}</p>
        </div>
        {(this.state.filteredReferencedByData ||
          this.state.filteredReferencingData) &&
        !this.state.loadingReferences ? (
          <div>
            <h3>Resources that reference {this.props.resource.id}:</h3>
            <SortableTable
              searchable={true}
              searchData={this.state.referencedByData
                .map(resource => resource.children)
                .flat()}
              searchPlaceholder="Search references..."
              searchTitleField="id"
              headerCells={this.props.tableHeaders}
              data={this.state.filteredReferencedByData}
              rowChildren={true}
              onChildRowClick={this.onChildRowClick}
              handleResultSelect={result =>
                this.handleResultSelect(result, 'referencedBy')
              }
              activeIndex={this.state.referencedByChildRowOpen}
            />
            <h3>Resources referenced by {this.props.resource.id}:</h3>
            <SortableTable
              searchable={true}
              searchPlaceholder="Search references..."
              searchTitleField="id"
              searchData={this.state.referencingData
                .map(resource => resource.children)
                .flat()}
              headerCells={this.props.tableHeaders}
              data={this.state.filteredReferencingData}
              rowChildren={true}
              onChildRowClick={this.onChildRowClick}
              handleResultSelect={result =>
                this.handleResultSelect(result, 'referencing')
              }
              activeIndex={this.state.referencingChildRowOpen}
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
                  <ReactJson src={this.state.showChildModal} />
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
