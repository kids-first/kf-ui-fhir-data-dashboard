import React from 'react';
import PropTypes from 'prop-types';
import {fetchResource, getResourceCount} from '../utils/api';
import {baseUrl, schemaUrl} from '../config';
import AppBreadcrumb from './AppBreadcrumb';
import DataPieChart from './DataPieChart';
import './ResourceDetails.css';

class ResourceDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resourceType: props.resourceType,
      resultsFetched: props.resultsFetched,
      total: props.total ? props.total : 0,
      fields: [],
    };
  }

  componentDidMount() {
    this.getResource();
  }

  getResource = () => {
    const cached = this.props.resultsFetched;
    this.setState({resultsFetched: false}, async () => {
      let total = this.state.total;
      if (!cached) {
        total = await this.props.getCount(
          `${baseUrl}${this.state.resourceType}`,
        );
      }
      let fields = await this.getFields();
      fields = fields ? await this.getQueryParams(fields) : [];
      this.setState(
        {
          resultsFetched: true,
          total,
          fields,
        },
        () => {
          this.setQueryResults();
        },
      );
    });
  };

  getFields = async () => {
    const data = await fetchResource(`${schemaUrl}${this.state.resourceType}`);
    let fields = {};
    if (data && data.snapshot && data.snapshot.element) {
      fields = data.snapshot.element
        .map(field => {
          let fieldName = null;
          let fieldNames = field.id.split('.');
          if (fieldNames.length > 1) {
            fieldName = fieldNames[fieldNames.length - 1].split('[')[0]; // might need more to this
          }
          let fieldType = null;
          let valueSetUrl = null;
          let queryParams = null;
          if (field.type) {
            const codeIndex = field.type.findIndex(obj => obj.code);
            if (codeIndex > -1 && field.type[codeIndex].code === 'code') {
              if (field.binding) {
                fieldType = 'enum';
                valueSetUrl = field.binding.valueSet;
              } else {
                fieldType = 'string'; // not correct
              }
            } else if (
              codeIndex > -1 &&
              field.type[codeIndex].code === 'boolean'
            ) {
              fieldType = 'boolean';
              queryParams = [
                {code: 'true', display: 'true'},
                {code: 'false', display: 'false'},
              ];
            }
          }
          return {
            fieldName,
            fieldType,
            valueSetUrl,
            queryParams,
          };
        })
        .filter(obj => obj.fieldName && obj.fieldType);
      return fields;
    }
  };

  // type --> code and no binding = string
  // type --> code and binding = enum --> valueset, compose --> include
  // parse .../valueset/... then concept.map(code)
  getQueryParams = async fields =>
    Promise.all(
      fields.map(async field => {
        if (field.valueSetUrl) {
          const url = field.valueSetUrl.split('/ValueSet')[1].split('|')[0];
          const data = await fetchResource(
            `${baseUrl}ValueSet${url}`,
            {},
            false,
          );
          let concepts = data.compose.include
            .map(obj => obj.concept)
            .filter(item => !!item);
          if (concepts.length === 0) {
            const systems = data.compose.include.map(obj => obj.system);
            concepts = await Promise.all(
              systems.map(async system => {
                system = system.substring(system.lastIndexOf('/'));
                const data = await fetchResource(
                  `${baseUrl}CodeSystem${system}`,
                  {},
                  false,
                );
                return data.concept;
              }),
            );
          }
          return {
            ...field,
            queryParams: concepts.flat(),
          };
        } else {
          return field;
        }
      }),
    );

  setQueryResults = async () => {
    let results = await this.getQueryResults();
    this.setState({fields: results});
  };

  getQueryResults = async () => {
    let fields = this.state.fields;
    fields = Promise.all(
      fields.map(async field => {
        if (field.queryParams) {
          field.queryParams = await Promise.all(
            field.queryParams.map(async param => {
              const data = await getResourceCount(
                `${baseUrl}${this.state.resourceType}?${field.fieldName}=${param.code}`,
              );
              return {
                ...param,
                count: data ? data.count : 0,
              };
            }),
          );
        }
        return field;
      }),
    );
    return fields;
  };

  formatResults = params =>
    params.map(obj => ({
      name: obj.display,
      value: 100, //obj.count ? obj.count : 0,
    }));

  render() {
    const {resourceType, total, fields} = this.state;
    return (
      <div className="resource-details">
        <AppBreadcrumb history={this.props.history} />
        <div
          className={`ui ${
            this.state.resultsFetched ? 'disabled' : 'active'
          } loader`}
        />
        <h2>
          {resourceType}: {total}
        </h2>
        <div className="resource-details__fields">
          {fields.map((field, i) => (
            <div className="resource-details__field" key={`${field}-${i}`}>
              <h3>{field.fieldName}</h3>
              {field.queryParams ? (
                <DataPieChart data={this.formatResults(field.queryParams)} />
              ) : (
                <p>No query params?</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

ResourceDetails.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      resourceType: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  results: PropTypes.object,
  resourceType: PropTypes.string.isRequired,
  hasResources: PropTypes.bool,
  getCount: PropTypes.func.isRequired,
  total: PropTypes.number,
};

ResourceDetails.defaultProps = {
  results: {},
  hasResources: false,
  total: 0,
};

export default ResourceDetails;
