import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown, Table} from 'semantic-ui-react';
import {defaultFhirAPIs} from '../config';
import SearchBar from './SearchBar';
import './OntologyHomepage.css';

class OntologyHomepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredOntologies: props.ontologies,
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

  getOntologies = async () => {
    this.props.getOntologies(`${this.props.baseUrl}CodeSystem`).then(() => {
      this.setState({filteredOntologies: this.props.ontologies});
    });
  };

  handleResultSelect = searchResults => {
    const {ontologies} = this.props;
    let filteredOntologies = {};
    searchResults.forEach(
      result => (filteredOntologies[result.title] = ontologies[result.title]),
    );
    this.setState({filteredOntologies});
  };

  render() {
    const {filteredOntologies} = this.state;
    const {ontologies, ontologiesFetched} = this.props;
    return (
      <div className="ontology-homepage">
        <Dropdown
          defaultValue={this.props.baseUrl}
          selection
          options={defaultFhirAPIs}
          onChange={this.selectApi}
          disabled={!this.props.ontologiesFetched}
        />
        <h2>Ontologies</h2>
        <SearchBar
          data={Object.keys(ontologies).map(key => ({
            title: key,
          }))}
          handleResultSelect={this.handleResultSelect}
          placeholder="Search for an ontology"
        />
        {ontologiesFetched ? (
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>URL</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {Object.keys(filteredOntologies).map((key, i) => (
                <Table.Row key={`${key}-${i}`}>
                  <Table.Cell>{key}</Table.Cell>
                  <Table.Cell>{filteredOntologies[key].join(', ')}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <div className="ui active loader" />
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
};

OntologyHomepage.defaultProps = {
  ontologies: {},
  ontologiesFetched: false,
};

export default OntologyHomepage;
