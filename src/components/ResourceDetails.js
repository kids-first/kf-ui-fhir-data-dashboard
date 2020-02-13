import React from 'react';
import PropTypes from 'prop-types';
import {getHumanReadableNumber} from '../utils/common';
import {fhirUrl} from '../config';
import AppBreadcrumb from './AppBreadcrumb';
import DataPieChart from './DataPieChart';
import './ResourceDetails.css';

class ResourceDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      total: props.total,
      attributes: [],
      queriesComplete: false,
    };
  }

  componentDidMount() {
    this.getResource();
  }

  componentDidUpdate() {
    window.scrollTo(0, 0);
  }

  getResource = () => {
    const {
      resourceBaseType,
      resourceFetched,
      resourceUrl,
      baseUrl,
    } = this.props;
    this.setState({queriesComplete: false}, async () => {
      let total = this.state.total;
      if (!resourceFetched) {
        total = await this.props.getCount(
          `${baseUrl}${resourceBaseType}?_profile:below=${resourceUrl}`,
        );
      }
      const schema = await this.getSchema();
      const attributes = schema ? await this.getQueryParams(schema) : [];
      this.setState(
        {
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
    const {
      resourceBaseType,
      resourceUrl,
      fetchResource,
      getSearchParams,
      getCapabilityStatement,
      baseUrl,
      schemaUrl,
      capabilityStatementUrl,
    } = this.props;
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
      capabilityStatementUrl,
      resourceBaseType,
    ).then(data => data.map(param => param.name));
    const queryableAttributes = new Set(searchParams.concat(defaultParams));
    let resourceAttributes = [];
    if (schema && schema.snapshot && schema.snapshot.element) {
      resourceAttributes = await this.getSnapshot(
        schema.snapshot.element,
        queryableAttributes,
      );
    } else if (schema && schema.differential && schema.differential.element) {
      resourceAttributes = await this.getDifferential(
        schema.differential.element,
        queryableAttributes,
      );
    }
    return resourceAttributes;
  };

  getSnapshot = async (schema, queryableAttributes) => {
    const attributes = await this.filterSchema(schema);
    const uniqueAttributes = [
      ...new Set(attributes.map(x => x.name)),
    ].map(name => attributes.find(attribute => attribute.name === name));
    const resourceAttributes = await this.parseSchema(
      uniqueAttributes,
      queryableAttributes,
    );
    return resourceAttributes;
  };

  getDifferential = async (differential, queryableAttributes) => {
    const {resourceBaseType, schemaUrl} = this.props;
    const data = await this.props.fetchResource(
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
    let snapshotAttributes = [];
    if (snapshot) {
      snapshotAttributes = await this.getSnapshot(
        snapshot,
        queryableAttributes,
      );
      const omittedAttributes = differential
        .filter(attribute => attribute.max === '0')
        .map(attribute => attribute.id);
      snapshotAttributes = snapshotAttributes.filter(
        attribute => !omittedAttributes.includes(attribute.id),
      );
    }
    const differentialAttributes = await this.getSnapshot(
      differential,
      queryableAttributes,
    );
    const allAttributes = differentialAttributes.concat(snapshotAttributes);
    let resourceAttributes = [
      ...new Set(allAttributes.map(x => x.name)),
    ].map(name => allAttributes.find(attribute => attribute.name === name));
    return resourceAttributes;
  };

  parseSchema = (schema, queryableAttributes) =>
    schema
      .map(attribute => {
        let newAttribute = {name: attribute.name, id: attribute.id};
        if (queryableAttributes.has(attribute.name)) {
          if (attribute.type) {
            const codeIndex = attribute.type.findIndex(obj => obj.code); // there can be more than one - [x] types
            if (
              codeIndex > -1 &&
              this.isCodeableConcept(attribute.type[codeIndex].code)
            ) {
              if (attribute.binding) {
                newAttribute.type = 'enum';
                newAttribute.valueSetUrl = attribute.binding.valueSet;
              }
            } else if (
              codeIndex > -1 &&
              attribute.type[codeIndex].code === 'boolean'
            ) {
              newAttribute.type = 'boolean';
              newAttribute.queryParams = [
                {code: 'true', display: 'true'},
                {code: 'false', display: 'false'},
              ];
            } else {
              newAttribute.type = 'count';
              newAttribute.queryParams = [{code: 'false'}];
            }
          }
        }
        return newAttribute;
      })
      .filter(obj => obj.name && obj.type);

  filterSchema = async snapshot => {
    let attributes = await Promise.all(
      snapshot.map(async attribute => {
        // don't show if attribute has been removed
        if (attribute.max !== '0') {
          // getting the human readable name for the resource attributes
          if (
            attribute.path &&
            attribute.path === `${this.props.resourceBaseType}.extension`
          ) {
            attribute.name = attribute.sliceName;
            if (
              attribute.type &&
              attribute.type[0] &&
              attribute.type[0].profile &&
              attribute.type[0].profile[0]
            ) {
              let data = await this.props.fetchResource(
                `${this.props.schemaUrl}?url=${attribute.type[0].profile[0]}`,
              );
              const extension =
                data && data.entry && data.entry[0] && data.entry[0].resource
                  ? data.entry[0].resource
                  : null;
              if (
                extension &&
                extension.differential &&
                extension.differential &&
                extension.differential.element
              ) {
                const extensionType = extension.differential.element
                  .map(x => x.type)
                  .filter(x => !!x)
                  .flat();
                attribute.type = extensionType;
              }
            }
          } else {
            const periodIndex = attribute.id.indexOf('.');
            attribute.name = attribute.id.split('[')[0]; // might need to look into this
            attribute.name =
              periodIndex > -1
                ? attribute.name
                    .substring(periodIndex + 1)
                    .split('.')
                    .join('-')
                    .toLowerCase()
                : attribute.name;
          }
        }
        return attribute;
      }),
    );
    return attributes.filter(attribute => !!attribute.name);
  };

  getQueryParams = async attributes =>
    Promise.all(
      attributes.map(async attribute => {
        if (attribute.valueSetUrl) {
          const url = attribute.valueSetUrl.split('|')[0]; // versions don't resolve
          const data = await this.props.fetchResource(
            `${this.props.baseUrl}ValueSet?url=${url}`,
          );
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
              const data = await this.props.fetchResource(
                `${this.props.baseUrl}CodeSystem?url=${system}`,
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
            queryParams: concepts.length < 100 ? concepts : [], // how to handle large sets of parameters? very slow
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
              const count = await this.props.getCount(
                `${this.props.baseUrl}${this.props.resourceBaseType}?_profile:below=${this.props.resourceUrl}&${name}=${param.code}`,
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

  getCharts = attributes => {
    let charts = {
      count: [],
      pie: [],
    };
    attributes.forEach(attribute => {
      const chartType = this.getChartType(attribute.type);
      if (chartType === 'pie') {
        charts.pie.push(attribute);
      } else if (chartType === 'count') {
        charts.count.push(attribute);
      }
    });
    return charts;
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
      chartResults.push({name: 'No Data', value: this.state.total - sum});
    }
    return chartResults;
  };

  render() {
    const {total, attributes, queriesComplete} = this.state;
    const {resourceBaseType, resourceType} = this.props;
    const charts = this.getCharts(attributes);
    return (
      <div className="resource-details">
        <AppBreadcrumb history={this.props.history} />
        <div
          className={`ui ${queriesComplete ? 'disabled' : 'active'} loader`}
        />
        <div className="resource-details__header">
          <div className="resource-details__header-title">
            <h2>{resourceType}</h2>
            <p>Base type: {resourceBaseType}</p>
          </div>
          <div className="resource-details__header-total">
            <p className="resource-details__count">
              {getHumanReadableNumber(total)}
            </p>
            <p>total</p>
          </div>
        </div>
        {queriesComplete && attributes.length === 0 ? (
          <h3>No statistics to display.</h3>
        ) : null}
        <div className="resource-details__queries">
          {Object.keys(charts).map(chartType => (
            <div key={chartType} className="resource-details__queries-section">
              {charts[chartType].map((attribute, i) => {
                if (queriesComplete) {
                  return (
                    <div
                      className="resource-details__query"
                      key={`${attribute}-${i}`}
                    >
                      <h3>{attribute.name}</h3>
                      {chartType === 'count' ? (
                        <div className="resource-details__query-count">
                          {attribute.queryParams.map((param, i) => (
                            <p
                              key={`${param}-${i}`}
                              className="resource-details__count"
                            >
                              {getHumanReadableNumber(param.count)}
                            </p>
                          ))}
                        </div>
                      ) : null}
                      {chartType === 'pie' ? (
                        <div className="resource-details__query-pie">
                          <DataPieChart
                            data={this.formatResults(attribute.queryParams)}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}
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
  getSearchParams: PropTypes.func.isRequired,
  getCapabilityStatement: PropTypes.func.isRequired,
  fetchResource: PropTypes.func.isRequired,
  baseUrl: PropTypes.string.isRequired,
  schemaUrl: PropTypes.string.isRequired,
  capabilityStatementUrl: PropTypes.string.isRequired,
};

ResourceDetails.defaultProps = {
  total: 0,
  resourceFetched: false,
};

export default ResourceDetails;
