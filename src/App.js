import React from 'react';
import fetchResource from './utils/api';
import {
  baseUrl,
  baseResource,
  baseResourceDisplayFields,
  omittedFields,
} from './config';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: {},
      queryInput: '',
      resultsFetched: false,
    };
  }

  // When page mounts, fetch all Patients
  async componentDidMount() {
    let temp = {};
    this.setState({ resultsFetched: false });
    temp = await this.fetchResource(`${baseUrl}${baseResource}?_count=100`, temp);
    this.setState({ results: temp, resultsFetched: true });
  }

  // Fetches next page if results returned are paginated
  getNextPage = (data) => {
    const nextPage = data.link.findIndex((x) => x.relation === 'next');
    return nextPage > -1 ? data.link[nextPage].url : null;
  }

  // Used to fetch a resource (ie. Patients, Observations..)
  fetchResource = async (url, temp) => {
    const data = await fetchResource(url);
    const newResources = temp;
    data.entry.forEach((entry) => {
      if (entry.fullUrl) {
        newResources[entry.fullUrl] = entry.resource;
      }
    });
    // Not working for SyntheticMass API (?)
    // url = this.getNextPage(data);
    // if (url) {
    //   return this.fetchResource(url, newResources);
    // }
    return newResources;
  }

  isObject = (obj) => obj === Object(obj);

  renderArrOfObj = (arr) => arr.map((elt, i) => {
    const str = this.flattenObj(elt, '');
    return <p key={str.concat(i)}>{ str }</p>;
  });

  /* eslint-disable no-param-reassign */
  flattenObj = (obj, str) => {
    Object.keys(obj).forEach((key) => {
      if (!omittedFields.includes(key)) {
        if (this.isObject(obj[key])) {
          str = str.concat(`${key}: ${this.flattenObj(obj[key], str)}`);
        } else {
          str = str.concat(`${key}: ${obj[key]}, `);
        }
      }
    });
    return str;
  }
  /* eslint-enable no-param-reassign */

  updateQuery = (e) => {
    this.setState({ queryInput: e.target.value });
  }

  queryResource = async () => {
    const { queryInput } = this.state;
    let temp = {};
    this.setState({ resultsFetched: false });
    temp = await this.fetchResource(`${baseUrl}${baseResource}?${queryInput}&_count=100`, temp);
    this.setState({ results: temp, resultsFetched: true });
  }

  render() {
    const { results, resultsFetched } = this.state;
    const resultList = Object.keys(results).map((resultKey, i) => {
      const listItem = results[resultKey];
      return (
        <div key={resultKey.concat(i)} className="result">
          {
            baseResourceDisplayFields.map((field, j) => {
              if (listItem[field]) {
                if (!this.isObject(listItem[field]) && !Array.isArray(listItem[field])) {
                  return (
                    <React.Fragment key={field.concat(j)}>
                      <p className="result-header">{ `${field}: ` }</p>
                      <p>{ listItem[field].toString() }</p>
                    </React.Fragment>
                  );
                }
                if (Array.isArray(listItem[field])) {
                  return (
                    <div key={field.concat(j)}>
                      <p className="result-header">{ `${field}:` }</p>
                      { this.renderArrOfObj(listItem[field]) }
                    </div>
                  );
                }
                return (
                  <div key={field.concat(j)}>
                    <p className="result-header">{ `${field}:` }</p>
                    { this.flattenObj(listItem[field], '') }
                  </div>
                );
              }
              return null;
            })
          }
        </div>
      );
    });

    return (
      <div className="app">
        <h1>Kids First FHIR Cohort Builder</h1>
        <h2>Query</h2>
        <div className="app_query">
          <input
            className="app_query-input"
            type="text"
            onChange={(e) => this.updateQuery(e)}
          />
          <button
            type="button"
            className="app_query-button"
            onClick={() => this.queryResource()}
          >
            Search
          </button>
        </div>
        <h2>
          Results (
          { resultList.length }
          )
        </h2>
        <div className="app_result-list">
          {
            resultsFetched ? resultList : <p>Loading...</p>
          }
        </div>
      </div>
    );
  }
}

export default App;
