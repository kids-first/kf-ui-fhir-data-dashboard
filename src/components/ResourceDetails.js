import React from 'react';
import PropTypes from 'prop-types';
import {Loader} from 'semantic-ui-react';
import {
  getHumanReadableNumber,
  getBaseResourceCount,
  logErrors,
  capitalize,
} from '../utils/common';
import DataBarChart from './DataBarChart';
import './ResourceDetails.css';

class ResourceDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      schema: null,
      resourceType: props.resourceId,
      resourceName: null,
      resourceBaseType: null,
      resourceUrl: null,
      total: props.total,
      attributes: [],
      queriesComplete: false,
      abortController: new AbortController(),
    };
  }

  componentDidMount() {
    this.getResource();
  }

  componentDidUpdate(prevProps) {
    window.scrollTo(0, 0);
    if (this.props.resourceId !== prevProps.resourceId) {
      this.setState({total: this.props.total}, () => {
        this.getResource();
      });
    }
  }

  componentWillUnmount() {
    this.state.abortController.abort();
    this.props.setLoadingMessage('');
  }

  getResource = () => {
    const {resourceId, resourceFetched, baseUrl, schemaUrl} = this.props;
    this.setState({queriesComplete: false}, async () => {
      this.props.setLoadingMessage(`Fetching ${resourceId}...`);
      this.props
        .fetchResource(
          `${schemaUrl}/${resourceId}/$snapshot`,
          this.state.abortController,
        )
        .then(async schema => {
          this.setState({
            schema,
            resourceType: schema.id,
            resourceName: schema.name,
            resourceBaseType: schema.type,
            resourceUrl: schema.url,
          });
          let {total, resourceType, resourceBaseType, resourceUrl} = this.state;
          if (!resourceFetched) {
            this.props.setLoadingMessage(`Fetching ${resourceType} totals...`);
            let url = `${baseUrl}${resourceBaseType}`;
            if (resourceBaseType !== resourceType) {
              url = url.concat(`?_profile:below=${resourceUrl}`);
              total = await this.props
                .getCount(url, this.state.abortController)
                .catch(err => {
                  logErrors('Error getting resource total:', err);
                  return 0;
                });
            } else {
              total = await getBaseResourceCount(
                baseUrl,
                resourceBaseType,
                null,
                this.state.abortController,
              ).catch(err => {
                logErrors('Error getting resource total:', err);
                return 0;
              });
            }
          }
          this.props.setLoadingMessage(`Getting ${resourceType} schema...`);
          await this.getSchema()
            .then(async schema => {
              if (schema) {
                this.props.setLoadingMessage(
                  `Getting ${resourceType} attributes...`,
                );
                await this.getQueryParams(schema)
                  .then(attributes => {
                    attributes = attributes ? attributes : [];
                    this.setState(
                      {
                        total: total ? total : 0,
                        attributes: attributes.filter(
                          attribute =>
                            attribute.queryParams &&
                            attribute.queryParams.length > 0,
                        ),
                      },
                      () => {
                        this.props.setLoadingMessage(`Populating charts...`);
                        this.setQueryResults();
                      },
                    );
                  })
                  .catch(err => logErrors('Error getting query params', err));
              }
            })
            .catch(err => logErrors('Error getting schema', err));
        })
        .catch(err => logErrors('Error fetching resource information:', err));
    });
  };

  isCodeableConcept = val => val === 'code' || val === 'CodeableConcept';

  getSchema = async () => {
    const {
      getSearchParams,
      getCapabilityStatement,
      baseUrl,
      capabilityStatementUrl,
    } = this.props;
    const {schema, resourceBaseType} = this.state;
    return await getSearchParams(
      `${baseUrl}SearchParameter?base=${resourceBaseType}`,
      this.state.abortController,
    )
      .then(
        async searchParams =>
          await getCapabilityStatement(
            capabilityStatementUrl,
            resourceBaseType,
            this.state.abortController,
          )
            .then(data => data.map(param => param.name))
            .then(async defaultParams => {
              const queryableAttributes = new Set(
                searchParams.concat(defaultParams),
              );
              let resourceAttributes = [];
              if (
                schema &&
                schema.snapshot &&
                schema.snapshot.element &&
                schema.differential &&
                schema.differential.element
              ) {
                resourceAttributes = await this.getDifferential(
                  schema.differential.element,
                  queryableAttributes,
                  schema.snapshot.element,
                );
              } else if (schema && schema.snapshot && schema.snapshot.element) {
                resourceAttributes = await this.getSnapshot(
                  schema.snapshot.element,
                  queryableAttributes,
                );
              }
              return resourceAttributes;
            })
            .catch(err => {
              logErrors('Error getting default params:', err);
              throw err;
            }),
      )
      .catch(err => {
        logErrors('Error getting search params:', err);
        throw err;
      });
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

  getDifferential = async (differential, queryableAttributes, snapshot) => {
    let snapshotAttributes = [];
    snapshotAttributes = await this.getSnapshot(snapshot, queryableAttributes);
    const omittedAttributes = differential
      .filter(attribute => attribute.max === '0')
      .map(attribute => attribute.id);
    snapshotAttributes = snapshotAttributes.filter(
      attribute => !omittedAttributes.includes(attribute.id),
    );
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
        let newAttribute = {
          name: attribute.name,
          id: attribute.id,
          extensionInfo: {...attribute.extensionInfo},
        };
        if (queryableAttributes.has(attribute.name)) {
          if (attribute.type) {
            const codeIndex = attribute.type.findIndex(
              obj =>
                (obj.code && obj.code === 'boolean') ||
                this.isCodeableConcept(obj.code),
            ); // there can be more than one - [x] types
            if (
              codeIndex > -1 &&
              this.isCodeableConcept(attribute.type[codeIndex].code)
            ) {
              if (attribute.binding || attribute.type[codeIndex].binding) {
                if (!attribute.binding) {
                  attribute.binding = attribute.type[codeIndex].binding;
                }
                newAttribute.type = 'enum';
                newAttribute.valueSetUrl = attribute.binding.valueSet;
              }
            } else if (
              codeIndex > -1 &&
              attribute.type[codeIndex].code === 'boolean'
            ) {
              newAttribute.type = 'boolean';
              newAttribute.queryParams = [
                {code: 'true', display: 'True'},
                {code: 'false', display: 'False'},
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
            attribute.path === `${this.state.resourceBaseType}.extension`
          ) {
            attribute.name = attribute.sliceName;
            attribute.extensionInfo = {};
            if (
              attribute.type &&
              attribute.type[0] &&
              attribute.type[0].profile &&
              attribute.type[0].profile[0]
            ) {
              attribute.extensionInfo = {
                ...attribute.extensionInfo,
                url: attribute.type[0].profile[0],
              };
              await this.props
                .fetchResource(
                  `${this.props.schemaUrl}?url=${attribute.type[0].profile[0]}`,
                  this.state.abortController,
                )
                .then(async data => {
                  const extension =
                    data &&
                    data.entry &&
                    data.entry[0] &&
                    data.entry[0].resource
                      ? data.entry[0].resource
                      : null;
                  if (
                    extension &&
                    extension.differential &&
                    extension.differential &&
                    extension.differential.element
                  ) {
                    let extensionTypes = [];
                    extension.differential.element.forEach(x => {
                      if (x.type) {
                        if (x.binding) {
                          x.type = x.type.map(code => ({
                            ...code,
                            binding: x.binding,
                          }));
                        }
                        extensionTypes.push(x.type);
                      }
                    });
                    attribute.type = extensionTypes.flat();
                  }
                })
                .catch(err => {
                  logErrors('Error getting differential:', err);
                  throw err;
                });
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
          return await this.props
            .fetchResource(
              `${this.props.baseUrl}ValueSet?url=${url}`,
              this.state.abortController,
            )
            .then(async data => {
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
                  return await this.props
                    .fetchResource(
                      `${this.props.baseUrl}CodeSystem?url=${system}`,
                      this.state.abortController,
                    )
                    .then(data =>
                      data &&
                      data.entry &&
                      data.entry[0] &&
                      data.entry[0].resource &&
                      data.entry[0].resource.concept
                        ? data.entry[0].resource.concept
                        : null,
                    )
                    .catch(err => {
                      logErrors('Error getting systems:', err);
                      throw err;
                    });
                }),
              );
              systemConcepts = systemConcepts.flat().filter(item => !!item);
              concepts.push(...systemConcepts);
              return {
                ...attribute,
                queryParams: concepts, // how to handle large sets of parameters? very slow
              };
            })
            .catch(err => {
              logErrors('Error getting query params', err);
              throw err;
            });
        } else {
          return attribute;
        }
      }),
    );

  setQueryResults = async () => {
    await this.getQueryResults()
      .then(results => {
        this.setState({attributes: results, queriesComplete: true});
      })
      .catch(err => {
        logErrors('Error setting query results:', err);
      });
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
              let url = `${this.props.baseUrl}${this.state.resourceBaseType}`;
              if (this.state.resourceBaseType !== this.state.resourceType) {
                url = url.concat(
                  `?_profile:below=${this.state.resourceUrl}&${name}=${param.code}`,
                );
              } else {
                url = url.concat(`?${name}=${param.code}`);
              }
              return await this.props
                .getCount(url, this.state.abortController)
                .then(count => ({
                  ...param,
                  count: count ? count : 0,
                }))
                .catch(err => {
                  logErrors('Error getting parameter counts:', err);
                  return {
                    ...param,
                    count: 0,
                  };
                });
            }),
          );
        }
        return attribute;
      }),
    );

  getChartType = (attributeType, parameterCount) => {
    switch (attributeType) {
      case 'enum':
        return parameterCount < 15 ? 'pie' : 'bar';
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
      bar: [],
    };
    attributes.forEach(attribute => {
      const chartType = this.getChartType(
        attribute.type,
        attribute.queryParams.length,
      );
      if (chartType === 'pie') {
        charts.pie.push(attribute);
      } else if (chartType === 'count') {
        charts.count.push(attribute);
      } else if (chartType === 'bar') {
        charts.bar.push(attribute);
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
        code: obj.code,
      };
    });
    if (sum < this.state.total) {
      chartResults.push({name: 'No Data', value: this.state.total - sum});
    }
    return chartResults;
  };

  getAttributeDetails = async (
    attribute,
    chartType,
    payload = {name: '', value: 0, code: null},
  ) => {
    if (payload.value > 0) {
      let query = '';
      if (chartType === 'count') {
        if (payload.name === 'all') {
          query = 'all';
        } else {
          query = `${attribute.name}:missing=false`;
        }
      } else {
        let param = attribute.queryParams.find(x => x.code === payload.code);
        if (!!param) {
          query = `${attribute.name}=${param.code}`;
        } else {
          param = {code: 'null'};
          query = `${attribute.name}:missing=true`;
        }
      }
      this.props.history.push(`${this.props.location.pathname}/${query}`);
    }
  };

  render() {
    const {
      total,
      attributes,
      queriesComplete,
      resourceBaseType,
      resourceType,
      resourceName,
    } = this.state;
    const charts = this.getCharts(attributes);
    return (
      <div className="resource-details">
        <div className="header">
          <div className="header__text">
            <h2>{resourceType}</h2>
            {resourceType !== resourceName ? (
              <h3>Name: {resourceName}</h3>
            ) : null}
            <h3>Base type: {resourceBaseType}</h3>
          </div>
        </div>
        <Loader
          inline
          active={queriesComplete ? false : true}
          content={this.props.loadingMessage}
        />
        {queriesComplete && attributes.length === 0 ? (
          <h4>No statistics to display.</h4>
        ) : null}
        {queriesComplete && attributes.length > 0 ? (
          <div>
            <div
              className={`resource-details__count-section${
                charts.pie.length === 0 || charts.bar.length === 0
                  ? ' no-height'
                  : ''
              }`}
            >
              <div
                className="resource-details__count card"
                onClick={() =>
                  this.getAttributeDetails({name: 'total'}, 'count', {
                    name: 'all',
                    value: total,
                  })
                }
              >
                <p className="resource-details__number">
                  {getHumanReadableNumber(total)}
                </p>
                <p>total</p>
              </div>
              {charts.count.map((attribute, i) => (
                <div
                  className="resource-details__count card"
                  key={`${attribute}-${i}`}
                  onClick={() =>
                    this.getAttributeDetails(attribute, 'count', {
                      value: attribute.queryParams[0]
                        ? attribute.queryParams[0].count
                        : 0,
                    })
                  }
                >
                  {attribute.queryParams.map((param, i) => (
                    <React.Fragment key={`${param}-${i}`}>
                      <p className="resource-details__number">
                        {getHumanReadableNumber(param.count)}
                      </p>
                      <p>have {attribute.name}</p>
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
            <div className="resource-details__bottom-section">
              {charts.pie.length > 0 ? (
                <div
                  className={`resource-details__pie-section${
                    charts.bar.length === 0 ? ' expand no-height' : ''
                  }`}
                >
                  {charts.pie.map((attribute, i) => {
                    const pieResults = this.formatResults(
                      attribute.queryParams,
                    );
                    return (
                      <div
                        key={attribute.name}
                        className="resource-details__pie card"
                      >
                        <h4>{capitalize(attribute.name)}</h4>
                        <div className="resource-details__pie-values">
                          {pieResults.map(result => (
                            <div
                              key={result.name}
                              className="resource-details__pie-value"
                              onClick={() =>
                                this.getAttributeDetails(
                                  attribute,
                                  'pie',
                                  result,
                                )
                              }
                            >
                              <p className="resource-details__number">
                                {getHumanReadableNumber(result.value)}
                              </p>
                              <p>{result.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {charts.bar.length > 0 ? (
                <div className="resource-details__bar-section">
                  {charts.bar.map((attribute, i) => (
                    <div
                      key={attribute.name}
                      className={`resource-details__bar card expand${
                        charts.pie.length === 0 ? ' no-height' : ''
                      }`}
                    >
                      <h4>{capitalize(attribute.name)}</h4>
                      <DataBarChart
                        data={this.formatResults(attribute.queryParams)}
                        handleClick={payload =>
                          this.getAttributeDetails(attribute, 'bar', payload)
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
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
      resourceId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  resourceId: PropTypes.string.isRequired,
  resourceFetched: PropTypes.bool,
  total: PropTypes.number,
  getCount: PropTypes.func.isRequired,
  getSearchParams: PropTypes.func.isRequired,
  getCapabilityStatement: PropTypes.func.isRequired,
  fetchResource: PropTypes.func.isRequired,
  baseUrl: PropTypes.string.isRequired,
  schemaUrl: PropTypes.string.isRequired,
  capabilityStatementUrl: PropTypes.string.isRequired,
  loadingMessage: PropTypes.string,
  setLoadingMessage: PropTypes.func.isRequired,
};

ResourceDetails.defaultProps = {
  total: 0,
  resourceFetched: false,
};

export default ResourceDetails;
