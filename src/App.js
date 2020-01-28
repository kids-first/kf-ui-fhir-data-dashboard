import React from 'react';
import {Button} from 'semantic-ui-react';
import {InfiniteLoader, AutoSizer, Table, Column} from 'react-virtualized';
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
  };

  isObject = obj => obj === Object(obj);

  flattenArrOfObj = arr => arr.map((elt, i) => this.flattenObj(elt, ''));

  flattenObj = (obj, str) => {
    Object.keys(obj).forEach(key => {
      if (!omittedFields.includes(key)) {
        if (this.isObject(obj[key])) {
          str = str.concat(`${key}: ${this.flattenObj(obj[key], str)}`);
        } else {
          str = str.concat(`${key}: ${obj[key]}, `);
        }
      }
    });
    return str;
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
      async () => {
        const data = await this.fetchResource(
          `${baseUrl}${baseResource}?${this.state.queryInput}`,
        );
        this.setState({results: data, resultsFetched: true});
      },
    );
  };

  isRowLoaded = ({index}) => !!this.state.results[index];

  cellRenderer = ({
    cellData,
    columnData,
    columnIndex,
    dataKey,
    isScrolling,
    rowData,
    rowIndex,
  }) => {
    if (cellData) {
      if (!this.isObject(cellData) && !Array.isArray(cellData)) {
        return <p>{cellData.toString()}</p>;
      }
      if (Array.isArray(cellData)) {
        return <p>{this.flattenArrOfObj(cellData)}</p>;
      }
      return <p>{this.flattenObj(cellData, '')}</p>;
    }
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
        <div className="app_result-list">
          {this.state.resultsFetched ? (
            <InfiniteLoader
              isRowLoaded={this.isRowLoaded}
              loadMoreRows={() => this.fetchResource(this.state.nextPageUrl)}
              rowCount={this.state.totalResults + 1}
            >
              {({onRowsRendered, registerChild}) => (
                <AutoSizer>
                  {({width}) => (
                    <Table
                      ref={registerChild}
                      onRowsRendered={onRowsRendered}
                      width={width}
                      height={500}
                      headerHeight={20}
                      rowHeight={50}
                      rowCount={this.state.totalResults + 1}
                      rowGetter={({index}) =>
                        this.state.results && this.state.results[index]
                          ? this.state.results[index]
                          : {}
                      }
                    >
                      {baseResourceDisplayFields.map((field, i) => (
                        <Column
                          key={`${field}-${i}`}
                          label={field}
                          dataKey={field}
                          width={width / baseResourceDisplayFields.length}
                          cellRenderer={this.cellRenderer}
                        />
                      ))}
                    </Table>
                  )}
                </AutoSizer>
              )}
            </InfiniteLoader>
          ) : (
            'Loading...'
          )}
        </div>
      </div>
    );
  }
}

export default App;
