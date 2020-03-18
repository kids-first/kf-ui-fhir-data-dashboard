import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown, Modal} from 'semantic-ui-react';
import {
  getHumanReadableNumber,
  getDropdownOptions,
  logErrors,
} from '../utils/common';
import SearchBar from './SearchBar';
import SortableTable from './tables/SortableTable';
import './OntologyHomepage.css';

class OntologyHomepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredOntologies: props.ontologies,
      listOntologies: this.mapToArray(props.ontologies),
      abortController: new AbortController(),
      ontologiesFetched: props.ontologiesFetched,
      selectedOntology: null,
      fetchingOntologyDetails: false,
      showModal: false,
    };
  }

  selectApi = (e, {value}) => {
    this.setState({ontologiesFetched: false, filteredOntologies: []}, () => {
      this.props.setBaseUrl(value);
    });
  };

  componentDidMount() {
    if (!this.props.ontologiesFetched) {
      this.getOntologies();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.baseUrl !== prevProps.baseUrl) {
      this.getOntologies();
    }
  }

  componentWillUnmount() {
    this.state.abortController.abort();
  }

  mapToArray = map =>
    Object.keys(map).map((key, i) => ({
      id: i,
      name: key,
      url: map[key],
    }));

  getOntologies = async () => {
    this.props
      .getOntologies(
        `${this.props.baseUrl}CodeSystem`,
        this.state.abortController,
      )
      .then(() => {
        this.setState({
          filteredOntologies: this.props.ontologies,
          listOntologies: this.mapToArray(this.props.ontologies),
          ontologiesFetched: true,
        });
      })
      .catch(err => logErrors('Error fetching ontologies:', err));
  };

  handleResultSelect = searchResults => {
    const {ontologies} = this.props;
    let filteredOntologies = {};
    searchResults.forEach(
      result => (filteredOntologies[result.title] = ontologies[result.title]),
    );
    this.setState({
      filteredOntologies,
      listOntologies: this.mapToArray(filteredOntologies),
    });
  };

  getOntologyDetails = async item => {
    if (item && item.url) {
      this.setState(
        {
          showModal: true,
          fetchingOntologyDetails: true,
          selectedOntology: {name: item.name},
        },
        async () => {
          await this.props
            .getOntologyDetails(
              `${this.props.baseUrl}CodeSystem?url=${item.url[0]}`,
              this.state.abortController,
            )
            .then(details => {
              this.setState({
                fetchingOntologyDetails: false,
                selectedOntology: {name: item.name, payload: details},
              });
            })
            .catch(err =>
              logErrors(
                'Error  getting details for CodeSystem',
                item.name,
                ': ',
                err,
              ),
            );
        },
      );
    }
  };

  closeModal = () => {
    this.setState({selectedOntology: null, showModal: false});
  };

  render() {
    const {filteredOntologies, listOntologies, ontologiesFetched} = this.state;
    const {ontologies} = this.props;

    const tableHeaders = [
      {display: 'Name', sortId: 'name'},
      {display: 'URL', sortId: 'url'},
    ];

    return (
      <div className="ontology-homepage">
        <div className="ontology-homepage__header">
          <div className="ontology-homepage__header-title">
            <h2>Ontologies:</h2>
            <h2 className="ontology-homepage__count">
              {getHumanReadableNumber(Object.keys(filteredOntologies).length)}
            </h2>
            <h2>total</h2>
          </div>
          <Dropdown
            className="ontology-homepage__dropdown"
            defaultValue={this.props.baseUrl}
            selection
            options={getDropdownOptions(this.props.serverOptions)}
            onChange={this.selectApi}
            disabled={!ontologiesFetched}
          />
        </div>
        <div className="ontology-homepage__search">
          <SearchBar
            data={Object.keys(ontologies).map(key => ({
              title: key,
            }))}
            handleResultSelect={this.handleResultSelect}
            placeholder="Search for an ontology"
          />
        </div>
        {this.props.ontologiesFetched ? (
          <SortableTable
            headerCells={tableHeaders}
            data={listOntologies}
            onRowClick={this.getOntologyDetails}
          />
        ) : (
          <div className="ui active loader">
            <p>{this.props.loadingMessage}</p>
          </div>
        )}
        <Modal
          open={this.state.showModal}
          onClose={() => this.closeModal()}
          dimmer="inverted"
        >
          <Modal.Header>
            {this.state.selectedOntology
              ? this.state.selectedOntology.name
              : ''}
          </Modal.Header>
          <Modal.Content>
            {!this.state.fetchingOntologyDetails &&
            this.state.selectedOntology ? (
              <pre>
                {JSON.stringify(this.state.selectedOntology.payload, null, 2)}
              </pre>
            ) : (
              <div className="ui active loader">
                <p>{this.props.loadingMessage}</p>
              </div>
            )}
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

OntologyHomepage.propTypes = {
  ontologies: PropTypes.object,
  baseUrl: PropTypes.string.isRequired,
  setBaseUrl: PropTypes.func.isRequired,
  ontologiesFetched: PropTypes.bool,
  getOntologies: PropTypes.func.isRequired,
  loadingMessage: PropTypes.string,
  serverOptions: PropTypes.array,
  getOntologyDetails: PropTypes.func.isRequired,
};

OntologyHomepage.defaultProps = {
  ontologies: {},
  ontologiesFetched: false,
  loadingMessage: '',
  serverOptions: [],
};

export default OntologyHomepage;
