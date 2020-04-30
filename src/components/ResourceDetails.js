import React from 'react';
import PropTypes from 'prop-types';
import {Modal, Header} from 'semantic-ui-react';
import {
  getHumanReadableNumber,
  getBaseResourceCount,
  logErrors,
  replaceLocalhost,
  capitalize,
} from '../utils/common';
import {defaultTableFields} from '../config';
import AppBreadcrumb from './AppBreadcrumb';
import DataBarChart from './DataBarChart';
import ResultsTable from './tables/ResultsTable';
import './ResourceDetails.css';

class ResourceDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      schema: null,
      resourceType: props.resourceId,
      resourceBaseType: null,
      resourceUrl: null,
      total: props.total,
      attributes: [],
      queriesComplete: false,
      showModal: false,
      modalAttribute: null,
      nextPageUrl: null,
      tableResults: [],
      tableLoaded: false,
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
  }

  getResource = () => {
    const {resourceId, resourceFetched, baseUrl, schemaUrl} = this.props;
    this.setState({queriesComplete: false}, async () => {
      this.props
        .fetchResource(
          `${schemaUrl}/${resourceId}/$snapshot`,
          this.state.abortController,
        )
        .then(async schema => {
          this.setState({
            schema,
            resourceType: schema.name,
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
      };
    });
    if (sum < this.state.total) {
      chartResults.push({name: 'No Data', value: this.state.total - sum});
    }
    return chartResults;
  };

  getAttributeTableResults = async (attribute, chartType, payload = null) => {
    this.setState(
      {
        showModal: true,
        tableLoaded: false,
        modalAttribute: attribute,
        totalResults: 0,
        tableResults: [],
      },
      async () => {
        this.props.setLoadingMessage(`Fetching ${attribute.name} details...`);
        const {baseUrl} = this.props;
        const {resourceBaseType, resourceType, resourceUrl} = this.state;
        let data = null;
        let totalResults = 0;
        let param = null;
        const allFields = defaultTableFields.concat(attribute.name);
        let url = `${baseUrl}${resourceBaseType}`;
        if (resourceBaseType !== resourceType) {
          url = url.concat(`?_profile:below=${resourceUrl}&`);
        } else {
          url = url.concat('?');
        }
        if (chartType === 'count') {
          data = await this.props
            .fetchResource(
              `${url}${attribute.name}:missing=false`,
              this.state.abortController,
            )
            .catch(err => logErrors('Error getting table results:', err));
          attribute.queryParams.forEach(param => {
            totalResults += param.count;
          });
        } else {
          param = attribute.queryParams.find(x => x.display === payload.name);
          if (!!param) {
            data = await this.props
              .fetchResource(
                `${url}${attribute.name}=${param.code}`,
                this.state.abortController,
              )
              .catch(err => logErrors('Error getting table results:', err));
          } else {
            param = {code: 'null'};
            data = await this.props
              .fetchResource(
                `${url}${attribute.name}:missing=true`,
                this.state.abortController,
              )
              .catch(err => logErrors('Error getting table results:', err));
          }
          totalResults = payload.value;
        }
        data = this.transformResults(data, attribute);
        const nextPage = data.link.findIndex(x => x.relation === 'next');
        let nextPageUrl = null;
        if (nextPage > -1) {
          nextPageUrl = replaceLocalhost(data.link[nextPage].url);
        }
        this.setState({
          tableLoaded: true,
          modalAttribute: {...attribute, param: param ? param.code : null},
          tableResults: data.results,
          nextPageUrl: nextPageUrl,
          totalResults,
          tableColumns: allFields,
        });
      },
    );
  };

  closeModal = () => {
    this.setState({
      showModal: false,
    });
  };

  transformResults = (data, attribute) => {
    let results =
      data && data.entry ? data.entry.map(item => item.resource) : [];
    if (attribute.extensionInfo && attribute.extensionInfo.url) {
      results.map(result => {
        const extensionIndex = result.extension.findIndex(
          ext => ext.url === attribute.extensionInfo.url,
        );
        const extension =
          extensionIndex > -1
            ? result.extension[extensionIndex].valueCodeableConcept
            : null;
        result[attribute.name] = extension;
        return result;
      });
    }
    return {results, link: data.link};
  };

  fetchNextPage = async url =>
    await this.props
      .fetchResource(url)
      .then(data => this.transformResults(data, this.state.modalAttribute));

  render() {
    const {
      total,
      attributes,
      queriesComplete,
      resourceBaseType,
      resourceType,
    } = this.state;
    const charts = this.getCharts(attributes);
    const selectedAttribute =
      this.state.modalAttribute && this.state.modalAttribute.name
        ? this.state.modalAttribute.name
        : null;
    const selectedParam =
      this.state.modalAttribute && this.state.modalAttribute.param
        ? this.state.modalAttribute.param
        : null;
    return (
      <div className="resource-details">
        <AppBreadcrumb history={this.props.history} />
        <div className={`ui ${queriesComplete ? 'disabled' : 'active'} loader`}>
          <p>{this.props.loadingMessage}</p>
        </div>
        <div className="resource-details__header">
          <h2>{resourceType}</h2>
          <p>Base type: {resourceBaseType}</p>
        </div>
        {queriesComplete && attributes.length === 0 ? (
          <h3>No statistics to display.</h3>
        ) : null}
        {queriesComplete && attributes.length > 0 ? (
          <div>
            <div className="resource-details__count-section">
              <div className="resource-details__count card">
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
                    this.getAttributeTableResults(attribute, 'count')
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
              <div className="resource-details__pie-section">
                {charts.pie.map((attribute, i) => {
                  const pieResults = this.formatResults(attribute.queryParams);
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
                              this.getAttributeTableResults(
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
              <div className="resource-details__bar-section">
                {charts.bar.map((attribute, i) => (
                  <div
                    key={attribute.name}
                    className="resource-details__bar card expand"
                  >
                    <h4>{capitalize(attribute.name)}</h4>
                    <DataBarChart
                      data={this.formatResults(attribute.queryParams)}
                      handleClick={payload =>
                        this.getAttributeTableResults(attribute, 'bar', payload)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        <Modal
          open={this.state.showModal}
          onClose={() => this.closeModal()}
          dimmer="inverted"
        >
          <Modal.Header>{this.state.resourceType}</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <Header>
                {getHumanReadableNumber(
                  this.state.totalResults ? this.state.totalResults : 0,
                )}{' '}
                results for{' '}
                {selectedAttribute
                  ? selectedAttribute.concat(
                      selectedParam ? ` = ${selectedParam}` : '',
                    )
                  : null}
              </Header>
              {this.state.tableLoaded ? (
                <ResultsTable
                  closeModal={this.closeModal}
                  history={this.props.history}
                  baseUrl={this.props.baseUrl}
                  fetchResource={this.fetchNextPage}
                  results={this.state.tableResults}
                  nextPageUrl={this.state.nextPageUrl}
                  totalResults={this.state.totalResults}
                  tableColumns={this.state.tableColumns}
                  loadingMessage={this.props.loadingMessage}
                  setLoadingMessage={this.props.setLoadingMessage}
                  searchCriteria={
                    selectedAttribute && selectedParam
                      ? `${selectedAttribute}=${selectedParam}`
                      : null
                  }
                />
              ) : (
                <div className="ui active loader">
                  <p>{this.props.loadingMessage}</p>
                </div>
              )}
            </Modal.Description>
          </Modal.Content>
        </Modal>
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
