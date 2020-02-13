import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown, Table} from 'semantic-ui-react';
import {defaultFhirAPIs} from '../config';
import './OntologyHomepage.css';

class OntologyHomepage extends React.Component {
  selectApi = (e, {value}) => {
    this.setState({filteredResources: {}}, () => {
      this.props.setBaseUrl(value);
    });
  };

  componentDidMount() {
    if (!this.props.ontologiesFetched) {
      this.getOntologies();
    }
  }

  getOntologies = async () => {
    this.props.getOntologies(`${this.props.baseUrl}CodeSystem`);
  };

  render() {
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
        {ontologiesFetched ? (
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>URL</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {ontologies.map((result, i) => (
                <Table.Row key={`${result.name}-${i}`}>
                  <Table.Cell>{result.name}</Table.Cell>
                  <Table.Cell>
                    <a href={result.url}>{result.url}</a>
                  </Table.Cell>
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
  ontologies: PropTypes.array,
  baseUrl: PropTypes.string.isRequired,
  setBaseUrl: PropTypes.func.isRequired,
  ontologiesFetched: PropTypes.bool,
  getOntologies: PropTypes.func.isRequired,
};

OntologyHomepage.defaultProps = {
  ontologies: [],
  ontologiesFetched: false,
};

export default OntologyHomepage;
