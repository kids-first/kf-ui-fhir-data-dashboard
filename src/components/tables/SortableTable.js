import React from 'react';
import PropTypes from 'prop-types';
import {Table} from 'semantic-ui-react';
import _ from 'lodash';
import './SortableTable.css';

class SortableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortColumn: props.headerCells[0].sortId,
      sortDirection: 'ascending',
      sortedData: _.sortBy(props.data, props.headerCells[0].sortId),
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data) {
      this.setState({
        sortedData: _.sortBy(this.props.data, this.props.headerCells[0].sortId),
      });
    }
  }

  handleSort = selectedColumn => {
    const {sortColumn, sortDirection, sortedData} = this.state;

    if (sortColumn !== selectedColumn) {
      this.setState({
        sortColumn: selectedColumn,
        sortedData: _.sortBy(sortedData, [selectedColumn]),
        sortDirection: 'ascending',
      });
    } else {
      this.setState({
        sortedData: sortedData.reverse(),
        sortDirection:
          sortDirection === 'ascending' ? 'descending' : 'ascending',
      });
    }
  };

  render() {
    const {headerCells, onRowClick} = this.props;
    const {sortDirection, sortColumn, sortedData} = this.state;

    return (
      <div className="sortable-table">
        <Table celled sortable>
          <Table.Header>
            <Table.Row>
              {headerCells.map((cell, i) => (
                <Table.HeaderCell
                  key={`${cell.sortId}-${i}`}
                  sorted={sortColumn === cell.sortId ? sortDirection : null}
                  onClick={() => this.handleSort(cell.sortId)}
                >
                  {cell.display}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedData.map((item, i) => (
              <Table.Row
                key={`${item.id}-${i}`}
                onClick={() => onRowClick(item)}
              >
                {headerCells.map(cell => (
                  <Table.Cell key={`${item.id}-${cell.sortId}-${i}`}>
                    {cell.func && item[cell.sortId] !== null
                      ? cell.func(item[cell.sortId])
                      : null}
                    {!cell.func && item[cell.sortId] !== null
                      ? item[cell.sortId]
                      : null}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    );
  }
}

SortableTable.propTypes = {
  headerCells: PropTypes.arrayOf(
    PropTypes.shape({
      display: PropTypes.string.isRequired,
      sortId: PropTypes.string.isRequired,
      func: PropTypes.func,
    }),
  ),
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ),
  onRowClick: PropTypes.func,
};

SortableTable.defaultProps = {
  headerCells: [],
  data: [],
  onRowClick: () => {},
};

export default SortableTable;
