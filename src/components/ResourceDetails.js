import React from 'react';
import PropTypes from 'prop-types';
import {
  fetchResource,
  getResourceCount,
  getSearchParams,
  getCapabilityStatement,
} from '../utils/api';
import {baseUrl, schemaUrl, fhirUrl} from '../config';
import AppBreadcrumb from './AppBreadcrumb';
import DataPieChart from './DataPieChart';
import './ResourceDetails.css';

class ResourceDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resourceBaseType: props.resourceBaseType,
      resourceType: props.resourceType,
      resourceUrl: props.resourceUrl,
      resourcesFetched: props.resourcesFetched,
      total: props.total ? props.total : 0,
      attributes: [],
      queriesComplete: false,
    };
  }

  componentDidMount() {
    this.getResource();
  }

  getResource = () => {
    const {resourcesFetched, resourceBaseType} = this.state;
    this.setState({resourcesFetched: false}, async () => {
      let total = this.state.total;
      if (!resourcesFetched) {
        total = await this.props.getCount(`${baseUrl}${resourceBaseType}`);
      }
      const schema = await this.getSchema();
      const attributes = schema ? await this.getQueryParams(schema) : [];
      this.setState(
        {
          resourcesFetched: true,
          total: total ? total : 0,
          attributes: attributes.filter(
            attribute =>
              attribute.queryParams && attribute.queryParams.length > 0,
          ),
        },
        () => {
          this.setQueryResults();
        },
      );
    });
  };

  isCodeableConcept = val => val === 'code' || val === 'CodeableConcept';

  getSchema = async () => {
    const {resourceBaseType, resourceUrl} = this.state;
    const data = await fetchResource(
      `${schemaUrl}?type=${resourceBaseType}&url=${resourceUrl}`,
    );
    const schema =
      data && data.entry && data.entry[0] && data.entry[0].resource
        ? data.entry[0].resource
        : null;
    const searchParams = await getSearchParams(
      `${baseUrl}SearchParameter?base=${resourceBaseType}`,
    );
    const defaultParams = await getCapabilityStatement(
      resourceBaseType,
    ).then(data => data.map(param => param.name));
    const queryableAttributes = new Set(searchParams.concat(defaultParams));
    let resourceAttributes = [];
    if (schema && schema.snapshot && schema.snapshot.element) {
      resourceAttributes = this.getSchemaSnapshot(
        schema.snapshot.element,
        queryableAttributes,
      );
    } else if (schema && schema.differential && schema.differential.element) {
      resourceAttributes = this.getSchemaDifferential(
        schema.differential.element,
        queryableAttributes,
      );
    }
    return resourceAttributes;
  };

  getSchemaSnapshot = (snapshot, queryableAttributes) =>
    snapshot
      .map(attribute => {
        // don't show if attribute has been removed
        if (attribute.max !== '0') {
          // getting the human readable name for the resource attributes
          let name = null;
          const periodIndex = attribute.id.indexOf('.');
          name = attribute.id.split('[')[0]; // might need to look into this
          name =
            periodIndex > -1
              ? name
                  .substring(periodIndex + 1)
                  .split('.')
                  .join('-')
                  .toLowerCase()
              : name;
          let type = null;
          let valueSetUrl = null;
          let queryParams = null;
          if (queryableAttributes.has(name)) {
            if (attribute.type) {
              const codeIndex = attribute.type.findIndex(obj => obj.code); // there can be more than one - [x] types
              if (
                codeIndex > -1 &&
                this.isCodeableConcept(attribute.type[codeIndex].code)
              ) {
                if (attribute.binding) {
                  type = 'enum';
                  valueSetUrl = attribute.binding.valueSet;
                }
              } else if (
                codeIndex > -1 &&
                attribute.type[codeIndex].code === 'boolean'
              ) {
                type = 'boolean';
                queryParams = [
                  {code: 'true', display: 'true'},
                  {code: 'false', display: 'false'},
                ];
              } else {
                type = 'count';
                queryParams = [{code: 'false'}];
              }
            }
          }
          return {
            id: attribute.id,
            name,
            type,
            valueSetUrl,
            queryParams,
          };
        }
        return {};
      })
      .filter(obj => obj.name && obj.type);

  getSchemaDifferential = async (differential, queryableAttributes) => {
    const {resourceBaseType} = this.state;
    const data = await fetchResource(
      `${schemaUrl}?type=${resourceBaseType}&url=${fhirUrl}${resourceBaseType}`,
    );
    const snapshot =
      data &&
      data.entry &&
      data.entry[0] &&
      data.entry[0].resource &&
      data.entry[0].resource.snapshot &&
      data.entry[0].resource.snapshot.element
        ? data.entry[0].resource.snapshot.element
        : null;
    let resourceAttributes = [];
    if (snapshot) {
      resourceAttributes = this.getSchemaSnapshot(
        snapshot,
        queryableAttributes,
      );
      const omittedAttributes = differential
        .filter(attribute => attribute.max === '0')
        .map(attribute => attribute.id);
      resourceAttributes = resourceAttributes.filter(
        attribute => !omittedAttributes.includes(attribute.id),
      );
    } else {
      resourceAttributes = this.getSchemaSnapshot(
        differential,
        queryableAttributes,
      );
    }
    return resourceAttributes;
  };

  getQueryParams = async attributes =>
    Promise.all(
      attributes.map(async attribute => {
        if (attribute.valueSetUrl) {
          const url = attribute.valueSetUrl.split('|')[0]; // versions don't resolve
          const data = await fetchResource(`${baseUrl}ValueSet?url=${url}`);
          const resource =
            data && data.entry && data.entry[0] && data.entry[0].resource
              ? data.entry[0].resource
              : null;
          let concepts =
            resource && resource.compose && resource.compose.include
              ? resource.compose.include
                  .map(obj => obj.concept)
                  .filter(item => !!item)
                  .flat()
              : [];
          const systems =
            resource && resource.compose && resource.compose.include
              ? resource.compose.include.map(obj => obj.system)
              : [];
          let systemConcepts = await Promise.all(
            systems.map(async system => {
              const data = await fetchResource(
                `${baseUrl}CodeSystem?url=${system}`,
              );
              return data &&
                data.entry &&
                data.entry[0] &&
                data.entry[0].resource &&
                data.entry[0].resource.concept
                ? data.entry[0].resource.concept
                : null;
            }),
          );
          systemConcepts = systemConcepts.flat().filter(item => !!item);
          concepts.push(...systemConcepts);
          return {
            ...attribute,
            queryParams: concepts.length < 100 ? concepts : [],
          };
        } else {
          return attribute;
        }
      }),
    );

  setQueryResults = async () => {
    let results = await this.getQueryResults();
    this.setState({attributes: results, queriesComplete: true});
  };

  getQueryResults = async () =>
    Promise.all(
      this.state.attributes.map(async attribute => {
        if (attribute.queryParams) {
          let name = attribute.name;
          if (attribute.type === 'count') {
            name = attribute.name.concat(':missing');
          }
          attribute.queryParams = await Promise.all(
            attribute.queryParams.map(async param => {
              const count = await getResourceCount(
                `${baseUrl}${this.state.resourceBaseType}?${name}=${param.code}`,
              );
              return {
                ...param,
                count: count ? count : 0,
              };
            }),
          );
        }
        return attribute;
      }),
    );

  getChartType = attributeType => {
    switch (attributeType) {
      case 'enum':
        return 'pie';
      case 'boolean':
        return 'pie';
      default:
        return attributeType;
    }
  };

  formatResults = params => {
    let sum = 0;
    let chartResults = params.map(obj => {
      const count = obj.count ? obj.count : 0;
      sum += count;
      return {
        name: obj.display ? obj.display : obj.code,
        value: obj.count ? obj.count : 0,
      };
    });
    if (sum < this.state.total) {
      chartResults.push({name: 'Missing', value: this.state.total - sum});
    }
    return chartResults;
  };

  render() {
    const {
      resourceBaseType,
      resourceType,
      total,
      attributes,
      resourcesFetched,
      queriesComplete,
    } = this.state;
    return (
      <div className="resource-details">
        <AppBreadcrumb history={this.props.history} />
        <div
          className={`ui ${
            resourcesFetched && queriesComplete ? 'disabled' : 'active'
          } loader`}
        />
        <div className="resource-details__header">
          <div className="resource-details__header-title">
            <h1>{resourceType}</h1>
            <p>Base type: {resourceBaseType}</p>
          </div>
          <div className="resource-details__header-total">
            <p className="resource-details__count">{total}</p>
            <p>total</p>
          </div>
        </div>
        {resourcesFetched && queriesComplete && attributes.length === 0 ? (
          <h3>No statistics to display.</h3>
        ) : null}
        <div className="resource-details__queries">
          {attributes
            .sort(attribute => (attribute.type === 'count' ? -1 : 1))
            .map((attribute, i) => {
              const chartType = this.getChartType(attribute.type);
              if (queriesComplete) {
                return (
                  <div
                    className="resource-details__query"
                    key={`${attribute}-${i}`}
                  >
                    <h3>{attribute.name}</h3>
                    {chartType === 'pie' ? (
                      <DataPieChart
                        data={this.formatResults(attribute.queryParams)}
                      />
                    ) : null}
                    {chartType === 'count' ? (
                      <div>
                        {attribute.queryParams.map((param, i) => (
                          <p
                            key={`${param}-${i}`}
                            className="resource-details__count"
                          >
                            {param.count}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }
              return null;
            })}
        </div>
      </div>
    );
  }
}

ResourceDetails.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      resourceBaseType: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  resourceBaseType: PropTypes.string.isRequired,
  resourceType: PropTypes.string.isRequired,
  resourceUrl: PropTypes.string.isRequired,
  resourceFetched: PropTypes.bool,
  total: PropTypes.number,
  getCount: PropTypes.func.isRequired,
};

ResourceDetails.defaultProps = {
  hasResources: false,
  total: 0,
};

export default ResourceDetails;
