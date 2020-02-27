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
import {getReferencedBy} from '../utils/api';
import {defaultTableFields} from '../config';
import SortableTable from './SortableTable';
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
      referenceData: null,
      loadingReferences: false,
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

  onViewInfo = rowData => {
    this.setState({rowData});
  };

  onViewReferences = rowData => {
    this.setState({referenceData: rowData});
    this.fetchReferences(rowData);
  };

  fetchReferences = async rowData => {
    this.setState(
      {loadingReferences: true, referenceData: {id: rowData.id}},
      async () => {
        const references = await getReferencedBy(
          this.props.baseUrl,
          rowData.resourceType,
          rowData.id,
        );
        let uniqueReferences = {};
        references.forEach(reference => {
          const mapValue =
            uniqueReferences[
              [reference.resourceType, reference.name, reference.profile]
            ];
          if (!!mapValue) {
            uniqueReferences[
              [reference.resourceType, reference.name, reference.profile]
            ] = {...mapValue, total: mapValue.total + 1};
          } else {
            uniqueReferences[
              [reference.resourceType, reference.name, reference.profile]
            ] = {...reference, total: 1};
          }
        });
        const referenceData = this.state.referenceData;
        referenceData.referencedBy = Object.values(uniqueReferences);
        this.setState({
          referenceData,
          loadingReferences: false,
        });
      },
    );
  };

  closeModal = () => {
    this.setState({rowData: null, referenceData: null});
  };

  onReferenceRowClick = item => {
    this.props.history.push(
      `/${item.resourceType}?name=${item.name}&url=${item.profile}`,
    );
    this.closeModal();
    this.props.closeModal();
  };

  render() {
    const referencedByTableHeaders = [
      {display: 'Resource Type', sortId: 'resourceType'},
      {display: 'Resource Name', sortId: 'name'},
      {display: 'Profile', sortId: 'profile'},
      {display: 'Total References', sortId: 'total'},
    ];
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
                <pre>{JSON.stringify(this.state.rowData, null, 2)}</pre>
              </div>
            </Modal.Description>
          </Modal.Content>
        </Modal>
        <Modal
          open={!!this.state.referenceData}
          onClose={() => this.closeModal()}
          dimmer="inverted"
        >
          <Modal.Header>Reference Information</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <div className="results-table__details">
                <div
                  className={`ui ${
                    this.state.loadingReferences ? 'active' : 'disabled'
                  } loader`}
                />
                {this.state.referenceData ? (
                  <div>
                    <h3>
                      Resources that reference {this.state.referenceData.id}:
                    </h3>
                    <SortableTable
                      headerCells={referencedByTableHeaders}
                      data={
                        this.state.referenceData.referencedBy
                          ? this.state.referenceData.referencedBy
                          : []
                      }
                      onRowClick={this.onReferenceRowClick}
                    />
                  </div>
                ) : null}
              </div>
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
};

ResultsTable.defaultProps = {
  closeModal: () => {},
  results: [],
  nextPageUrl: null,
  totalResults: 0,
  tableColumns: defaultTableFields,
};
