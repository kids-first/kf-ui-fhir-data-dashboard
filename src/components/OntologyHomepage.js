import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown} from 'semantic-ui-react';
import {getHumanReadableNumber, getDropdownOptions} from '../utils/common';
import SearchBar from './SearchBar';
import SortableTable from './tables/SortableTable';
import './OntologyHomepage.css';

class OntologyHomepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredOntologies: props.ontologies,
      listOntologies: this.mapToArray(props.ontologies),
    };
  }

  selectApi = (e, {value}) => {
    this.setState({filteredOntologies: []}, () => {
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

  mapToArray = map =>
    Object.keys(map).map((key, i) => ({
      id: i,
      name: key,
      url: map[key],
    }));

  getOntologies = async () => {
    this.props.getOntologies(`${this.props.baseUrl}CodeSystem`).then(() => {
      this.setState({
        filteredOntologies: this.props.ontologies,
        listOntologies: this.mapToArray(this.props.ontologies),
      });
    });
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

  render() {
    const {filteredOntologies, listOntologies} = this.state;
    const {ontologies, ontologiesFetched} = this.props;

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
            disabled={!this.props.ontologiesFetched}
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
        {ontologiesFetched ? (
          <SortableTable headerCells={tableHeaders} data={listOntologies} />
        ) : (
          <div className="ui active loader">
            <p>{this.props.loadingMessage}</p>
          </div>
        )}
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
};

OntologyHomepage.defaultProps = {
  ontologies: {},
  ontologiesFetched: false,
  loadingMessage: '',
  serverOptions: [],
};

export default OntologyHomepage;
