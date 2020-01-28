import React from 'react';
import PropTypes from 'prop-types';
import {InfiniteLoader, AutoSizer, Table, Column} from 'react-virtualized';
import {baseResourceDisplayFields, omittedFields} from '../config';
import './ResultsTable.css';

class ResultsTable extends React.Component {
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

  isRowLoaded = ({index}) => !!this.props.results[index];

  cellRenderer = ({
    cellData,
    columnData,
    columnIndex,
    dataKey,
    isScrolling,
    rowData,
    rowIndex,
  }) => {
    if (Object.keys(rowData).length === 0) {
      return (
        <div className="ui placeholder">
          <div className="line" />
          <div className="line" />
        </div>
      );
    } else if (cellData) {
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
      <div className="results-table">
        <InfiniteLoader
          isRowLoaded={this.isRowLoaded}
          loadMoreRows={() => this.props.fetchResource(this.props.nextPageUrl)}
          rowCount={this.props.totalResults}
        >
          {({onRowsRendered, registerChild}) => (
            <AutoSizer>
              {({width, height}) => (
                <Table
                  className="results-table__body"
                  ref={registerChild}
                  onRowsRendered={onRowsRendered}
                  width={width}
                  height={height}
                  headerHeight={20}
                  rowHeight={50}
                  rowCount={this.props.totalResults}
                  rowGetter={({index}) =>
                    this.props.results && this.props.results[index]
                      ? this.props.results[index]
                      : {}
                  }
                >
                  {baseResourceDisplayFields.map((field, i) => (
                    <Column
                      className="results-table__cell"
                      key={`${field}-${i}`}
                      label={field}
                      dataKey={field}
                      cellRenderer={this.cellRenderer}
                      width={1}
                      flexGrow={1}
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
};

ResultsTable.defaultProps = {
  results: [],
  nextPageUrl: null,
  totalResults: 0,
};
