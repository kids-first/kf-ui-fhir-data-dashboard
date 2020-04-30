import React from 'react';
import PropTypes from 'prop-types';
import ReactJson from 'react-json-view';
import {Modal, Loader} from 'semantic-ui-react';
import {getHumanReadableNumber, logErrors} from '../utils/common';
import SearchBar from './SearchBar';
import SortableTable from './tables/SortableTable';
import './OntologyHomepage.css';

class OntologyHomepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredOntologies: props.ontologies,
      listOntologies: this.mapToArray(props.ontologies),
      ontologiesFetched: props.ontologiesFetched,
      selectedOntology: null,
      fetchingOntologyDetails: false,
      showModal: false,
      abortController: new AbortController(),
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
        <div className="header">
          <div className="header__text">
            <h2>Ontologies</h2>
            <h3>
              {getHumanReadableNumber(Object.keys(filteredOntologies).length)}{' '}
              total
            </h3>
          </div>
          <div className="header__controls">
            <SearchBar
              className="header__searchbar"
              data={Object.keys(ontologies).map(key => ({
                title: key,
              }))}
              handleResultSelect={this.handleResultSelect}
              placeholder="Search for an ontology"
            />
          </div>
        </div>
        {ontologiesFetched ? (
          <SortableTable
            headerCells={tableHeaders}
            data={listOntologies}
            onRowClick={this.getOntologyDetails}
          />
        ) : (
          <Loader inline active content={this.props.loadingMessage} />
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
              <ReactJson src={this.state.selectedOntology.payload} />
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
