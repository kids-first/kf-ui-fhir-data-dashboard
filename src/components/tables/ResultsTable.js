import React from 'react';
import PropTypes from 'prop-types';
import {
  InfiniteLoader,
  AutoSizer,
  Table,
  Column,
  CellMeasurerCache,
  CellMeasurer,
} from 'react-virtualized';
import {Modal, Icon} from 'semantic-ui-react';
import ReactJson from 'react-json-view';
import {logErrors} from '../../utils/common';
import {defaultTableFields, defaultFhirServerPrefix} from '../../config';
import SearchBar from '../SearchBar';
import ReferenceTable from './ReferenceTable';
import './ResultsTable.css';
const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  defaultHeight: 20, // keep this <= any actual row height
  minHeight: 10, // keep this <= any actual row height
});

const rowCache = new CellMeasurerCache({
  fixedWidth: true,
  defaultHeight: 50, // tune as estimate for unmeasured rows
  minHeight: 10, // keep this <= any actual row height
});

const aMeasuredColumnIndex = 2; // any measured column index will do

let rowParent = null; // let a cellRenderer supply a usable value

const cellParent = {
  // an intermediary between measured row cells
  //   and their true containing Grid
  invalidateCellSizeAfterRender: ({rowIndex}) => {
    if (
      rowParent &&
      typeof rowParent.invalidateCellSizeAfterRender == 'function'
    ) {
      rowParent.invalidateCellSizeAfterRender({columnIndex: 0, rowIndex});
    }
  },
};

class ResultsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: props.results,
      nextPageUrl: props.nextPageUrl,
      rowData: null,
      showReferences: false,
      searchResults: [],
      searchMode: false,
    };
  }
  componentDidMount() {
    cellCache.clearAll();
    rowCache.clearAll();
  }

  measuredCellRenderer = ({
    rowData,
    rowIndex,
    columnIndex,
    parent,
    cellData,
  }) => {
    rowParent = parent; // parent is the Table's grid,
    //   save it for use by rowRenderer
    return (
      <CellMeasurer
        cache={cellCache}
        columnIndex={columnIndex}
        parent={cellParent}
        rowIndex={rowIndex}
      >
        <div className="results-table__cell">
          {columnIndex === this.props.tableColumns.length ? (
            <div className="results-table__cell-icons">
              <Icon
                name="info circle"
                size="big"
                onClick={() => this.onViewInfo(rowData)}
                title="See the full payload for this row"
              />
              <Icon
                name="connectdevelop"
                size="big"
                onClick={() => this.onViewReferences(rowData)}
                title="See resources that reference this row"
              />
            </div>
          ) : null}
          {columnIndex < this.props.tableColumns.length && cellData ? (
            <pre>{JSON.stringify(cellData, null, 2)}</pre>
          ) : null}
          {columnIndex < this.props.tableColumns.length && !cellData ? (
            <pre>No data</pre>
          ) : null}
        </div>
      </CellMeasurer>
    );
  };

  rowRenderer = params => {
    return (
      <CellMeasurer
        cache={rowCache}
        columnIndex={0}
        key={params.key}
        parent={rowParent}
        rowIndex={params.rowIndex}
      >
        {Table.defaultProps.rowRenderer(params)}
      </CellMeasurer>
    );
  };

  rowHeight = ({index}) => {
    let cellCacheRowHeight = cellCache.rowHeight({index});
    if (cellCache.has(index, aMeasuredColumnIndex)) {
      rowCache.set(index, 0, 20, cellCacheRowHeight);
      // the 20 above is a somewhat arbitrary number for width,
      //   which is not relevant
    }
    return cellCacheRowHeight;
  };

  isRowLoaded = ({index}) => !!this.state.results[index];

  rowClassName = ({index}) =>
    'results-table__row-'.concat(index % 2 === 0 ? 'even' : 'odd');

  loadMoreRows = async () => {
    if (this.state.nextPageUrl) {
      const data = await this.props.fetchResource(this.state.nextPageUrl);
      const nextPageUrl = this.getNextPage(data);
      let allResults = this.state.results.concat(data.results);
      cellCache.clearAll();
      rowCache.clearAll();
      this.setState({results: allResults, nextPageUrl});
    }
  };

  getNextPage = results => {
    const nextPage = results.link.findIndex(x => x.relation === 'next');
    let nextPageUrl = null;
    if (nextPage > -1) {
      nextPageUrl = results.link[nextPage].url.replace(
        'localhost',
        defaultFhirServerPrefix,
      );
    }
    return nextPageUrl;
  };

  onViewInfo = rowData => {
    this.setState({rowData});
  };

  onViewReferences = rowData => {
    this.setState({rowData, showReferences: true});
  };

  closeModal = () => {
    this.setState({rowData: null, showReferences: false});
  };

  onReferenceRowClick = item => {
    this.props.history.push(
      `/${item.resourceType}?name=${item.name}&url=${item.profile}`,
    );
    this.closeModal();
    this.props.closeModal();
  };

  handleSubmit = async input => {
    if (input === '') {
      cellCache.clearAll();
      rowCache.clearAll();
      this.setState({searchResults: [], searchMode: false});
    } else {
      const resourceType =
        this.state.results && this.state.results[0]
          ? this.state.results[0].resourceType
          : null;
      if (resourceType) {
        await this.props
          .fetchResource(
            `${this.props.baseUrl}${resourceType}?_id=${input}&_total=accurate`.concat(
              this.props.searchCriteria ? `&${this.props.searchCriteria}` : '',
            ),
          )
          .then(data => {
            cellCache.clearAll();
            rowCache.clearAll();
            this.setState({
              searchResults: data.results,
              searchMode: true,
            });
          })
          .catch(err => logErrors(`Error searching for ID ${input}: `, err));
      }
    }
  };

  clearResults = () => {
    cellCache.clearAll();
    rowCache.clearAll();
    this.setState({
      searchResults: [],
      searchMode: false,
    });
  };

  render() {
    const referencedByTableHeaders = [
      {display: 'Resource Type', sortId: 'resourceType'},
      {display: 'Resource Name', sortId: 'name'},
      {display: 'Profile', sortId: 'profile'},
      {display: 'Total References', sortId: 'total'},
    ];

    const results = this.state.searchMode
      ? this.state.searchResults
      : this.state.results;
    const totalRows = this.state.searchMode
      ? this.state.searchResults.length
      : this.props.totalResults;

    return (
      <div className="results-table">
        <div className="results-table__search">
          <SearchBar
            open={false}
            handleSubmit={this.handleSubmit}
            clearResults={this.clearResults}
            placeholder="Enter an ID here..."
            searchOnClick={true}
          />
        </div>
        <InfiniteLoader
          isRowLoaded={this.isRowLoaded}
          loadMoreRows={this.loadMoreRows}
          rowCount={totalRows}
        >
          {({onRowsRendered, registerChild}) => (
            <AutoSizer>
              {({width, height}) => (
                <Table
                  className="results-table__body"
                  rowClassName={this.rowClassName}
                  ref={registerChild}
                  onRowsRendered={onRowsRendered}
                  width={width}
                  height={height}
                  headerHeight={20}
                  rowCount={totalRows}
                  rowGetter={({index}) =>
                    results && results[index] ? results[index] : {}
                  }
                  rowRenderer={this.rowRenderer}
                  rowHeight={this.rowHeight}
                >
                  {this.props.tableColumns.map((field, i) => (
                    <Column
                      className="results-table__cell"
                      key={`${field}-${i}`}
                      label={field}
                      dataKey={field}
                      width={width / this.props.tableColumns.length - 100}
                      flexGrow={0}
                      cellRenderer={this.measuredCellRenderer}
                    />
                  ))}
                  <Column
                    className="results-table__cell"
                    label=""
                    dataKey=""
                    width={100}
                    flexGrow={0}
                    cellRenderer={this.measuredCellRenderer}
                  />
                </Table>
              )}
            </AutoSizer>
          )}
        </InfiniteLoader>
        <Modal
          open={!!this.state.rowData}
          onClose={() => this.closeModal()}
          dimmer="inverted"
        >
          <Modal.Header>Row Details</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <div className="results-table__details">
                <ReactJson src={this.state.rowData} />
              </div>
            </Modal.Description>
          </Modal.Content>
        </Modal>
        <Modal
          open={this.state.showReferences}
          onClose={() => this.closeModal()}
          dimmer="inverted"
        >
          <Modal.Header>Reference Information</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <ReferenceTable
                onClick={this.onReferenceRowClick}
                tableHeaders={referencedByTableHeaders}
                resource={this.state.rowData ? this.state.rowData : null}
                baseUrl={this.props.baseUrl}
                loadingMessage={this.props.loadingMessage}
                setLoadingMessage={this.props.setLoadingMessage}
              />
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

export default ResultsTable;

ResultsTable.propTypes = {
  closeModal: PropTypes.func,
  history: PropTypes.object.isRequired,
  baseUrl: PropTypes.string.isRequired,
  fetchResource: PropTypes.func.isRequired,
  results: PropTypes.array,
  nextPageUrl: PropTypes.string,
  totalResults: PropTypes.number,
  tableColumns: PropTypes.array,
  loadingMessage: PropTypes.string,
  setLoadingMessage: PropTypes.func.isRequired,
  searchCriteria: PropTypes.string,
};

ResultsTable.defaultProps = {
  closeModal: () => {},
  results: [],
  nextPageUrl: null,
  totalResults: 0,
  tableColumns: defaultTableFields,
  loadingMessage: '',
  searchCriteria: null,
};
