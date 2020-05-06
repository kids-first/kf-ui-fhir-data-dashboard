import React from 'react';
import PropTypes from 'prop-types';
import {Loader} from 'semantic-ui-react';
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
      abortController: new AbortController(),
    };
  }

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
      id: key,
      name: map[key].name,
      url: map[key].url,
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

  getOntologyDetails = item => {
    this.props.history.push(`/ontologies/${item.id}`);
  };

  render() {
    const {filteredOntologies, listOntologies, ontologiesFetched} = this.state;
    const {ontologies} = this.props;
    const tableHeaders = [
      {display: 'ID', sortId: 'id', sort: true},
      {display: 'Name', sortId: 'name', sort: true},
      {display: 'URL', sortId: 'url', sort: true},
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
      </div>
    );
  }
}

OntologyHomepage.propTypes = {
  ontologies: PropTypes.object,
  baseUrl: PropTypes.string.isRequired,
  ontologiesFetched: PropTypes.bool,
  getOntologies: PropTypes.func.isRequired,
  loadingMessage: PropTypes.string,
  getOntologyDetails: PropTypes.func.isRequired,
};

OntologyHomepage.defaultProps = {
  ontologies: {},
  ontologiesFetched: false,
  loadingMessage: '',
};

export default OntologyHomepage;
