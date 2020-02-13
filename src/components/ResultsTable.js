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
import {defaultTableFields} from '../config';
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
        {Object.keys(rowData).length === 0 ? (
          <div className="ui active loader" />
        ) : null}
        {cellData ? <pre>{JSON.stringify(cellData, null, 2)}</pre> : null}
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
      let data = await this.props.fetchResource(this.state.nextPageUrl);
      let results =
        data && data.entry ? data.entry.map(item => item.resource) : [];
      const nextPage = data.link.findIndex(x => x.relation === 'next');
      let nextPageUrl = null;
      if (nextPage > -1) {
        nextPageUrl = data.link[nextPage].url.replace(
          'localhost',
          '10.10.1.191',
        );
      }
      let allResults = this.state.results.concat(results);
      cellCache.clearAll();
      rowCache.clearAll();
      this.setState({results: allResults, nextPageUrl});
    }
  };

  render() {
    return (
      <div className="results-table">
        <InfiniteLoader
          isRowLoaded={this.isRowLoaded}
          loadMoreRows={this.loadMoreRows}
          rowCount={this.props.totalResults}
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
                  rowCount={this.props.totalResults}
                  rowGetter={({index}) =>
                    this.state.results && this.state.results[index]
                      ? this.state.results[index]
                      : {}
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
                      width={width / this.props.tableColumns.length}
                      flexGrow={0}
                      cellRenderer={this.measuredCellRenderer}
                    />
                  ))}
                </Table>
              )}
            </AutoSizer>
          )}
        </InfiniteLoader>
      </div>
    );
  }
}

export default ResultsTable;

ResultsTable.propTypes = {
  fetchResource: PropTypes.func.isRequired,
  results: PropTypes.array,
  nextPageUrl: PropTypes.string,
  totalResults: PropTypes.number,
  tableColumns: PropTypes.array,
};

ResultsTable.defaultProps = {
  results: [],
  nextPageUrl: null,
  totalResults: 0,
  tableColumns: defaultTableFields,
};
