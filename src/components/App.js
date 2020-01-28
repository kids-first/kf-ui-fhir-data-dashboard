import React from 'react';
import {Button} from 'semantic-ui-react';
import fetchResource from '../utils/api';
import {baseUrl, baseResource} from '../config';
import ResultsTable from './ResultsTable';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      nextPageUrl: `${baseUrl}${baseResource}`,
      totalResults: 0,
      queryInput: '',
      resultsFetched: false,
    };
  }

  // When page mounts, fetch all Patients
  componentDidMount() {
    this.fetchResource(`${baseUrl}${baseResource}`);
  }

  // Fetches next page if results returned are paginated
  getNextPage = data => {
    const nextPage = data.link.findIndex(x => x.relation === 'next');
    return nextPage > -1 ? data.link[nextPage].url : null;
  };

  // Used to fetch a resource (ie. Patients, Observations..)
  fetchResource = async url => {
    if (url) {
      const currentResults = this.state.results;
      const data = await fetchResource(url);
      const newResults =
        data && data.entry ? data.entry.map(entry => entry.resource) : [];
      const totalResults = currentResults.concat(newResults);
      const nextPageUrl = data ? this.getNextPage(data) : null;
      this.setState({
        results: totalResults,
        nextPageUrl: nextPageUrl,
        totalResults: totalResults.length,
        resultsFetched: true,
      });
    }
  };

  updateQuery = e => {
    this.setState({queryInput: e.target.value});
  };

  queryResource = () => {
    this.setState(
      {
        resultsFetched: false,
        totalResults: 0,
        results: [],
      },
      () =>
        this.fetchResource(
          `${baseUrl}${baseResource}?${this.state.queryInput}`,
        ),
    );
  };

  render() {
    return (
      <div className="app">
        <h1>Kids First FHIR Cohort Builder</h1>
        <div className="app_query">
          <h2>Query</h2>
          <input
            className="app_query-input"
            type="text"
            onChange={e => this.updateQuery(e)}
          />
          <Button primary type="button" onClick={() => this.queryResource()}>
            Search
          </Button>
        </div>
        {this.state.resultsFetched && this.state.results.length === 0
          ? 'No results'
          : null}
        {this.state.resultsFetched && this.state.results.length > 0 ? (
          <ResultsTable
            fetchResource={this.fetchResource}
            results={this.state.results}
            nextPageUrl={this.state.nextPageUrl}
            totalResults={this.state.totalResults + 1}
          />
        ) : null}
        <div
          className={`ui ${
            this.state.resultsFetched ? 'disabled' : 'active'
          } loader`}
        />
      </div>
    );
  }
}

export default App;
