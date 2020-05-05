import React from 'react';
import PropTypes from 'prop-types';
import {Table, Icon} from 'semantic-ui-react';
import _ from 'lodash';
import SearchBar from '../SearchBar';
import './SortableTable.css';

class SortableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortColumn: props.headerCells[0].sortId,
      sortDirection: 'ascending',
      sortedData: _.sortBy(props.data, props.headerCells[0].sortId),
      activeIndex: props.activeIndex,
    };
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.data !== prevProps.data ||
      this.props.data.map(x => x.children).flat().length !==
        this.state.sortedData.map(x => x.children).flat().length ||
      this.props.data !== prevProps.data
    ) {
      this.setState({
        sortedData: _.sortBy(this.props.data, this.props.headerCells[0].sortId),
      });
    }
    if (this.props.activeIndex !== prevProps.activeIndex) {
      this.setState({activeIndex: this.props.activeIndex});
    }
  }

  handleSort = (selectedColumn, sort) => {
    const {sortColumn, sortDirection, sortedData} = this.state;
    if (sort) {
      if (selectedColumn && sortColumn !== selectedColumn) {
        this.setState({
          sortColumn: selectedColumn,
          sortedData: _.sortBy(sortedData, [selectedColumn]),
          sortDirection: 'ascending',
        });
      } else if (selectedColumn) {
        this.setState({
          sortedData: sortedData.reverse(),
          sortDirection:
            sortDirection === 'ascending' ? 'descending' : 'ascending',
        });
      }
    }
  };

  toggleIndex = index => {
    const currentIndex = this.state.activeIndex;
    this.setState({
      activeIndex: currentIndex === index ? -1 : index,
    });
  };

  renderIcon = index =>
    this.state.activeIndex === index ? 'caret up' : 'caret down';

  onRowClick = (item, index) => {
    this.toggleIndex(index);
    this.props.onRowClick(item);
  };

  render() {
    const {headerCells, rowChildren, searchable} = this.props;
    const {sortDirection, sortColumn, sortedData} = this.state;

    return (
      <div className="sortable-table">
        {searchable ? (
          <SearchBar
            data={this.props.searchData.map(item => ({
              title: item[this.props.searchTitleField],
            }))}
            handleResultSelect={e => this.props.handleResultSelect(e)}
            placeholder={this.props.searchPlaceholder}
          />
        ) : null}
        <Table celled sortable>
          <Table.Header>
            <Table.Row>
              {headerCells.map((cell, i) => (
                <Table.HeaderCell
                  key={`${cell.sortId}-${i}`}
                  sorted={sortColumn === cell.sortId ? sortDirection : null}
                  onClick={() => this.handleSort(cell.sortId, cell.sort)}
                >
                  {cell.display}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedData.map((item, i) => (
              <React.Fragment key={i}>
                <Table.Row
                  key={`${item.id}-${i}`}
                  onClick={() => this.onRowClick(item, i)}
                >
                  {headerCells.map((cell, j) => {
                    const icon =
                      rowChildren && j === 0 ? (
                        <Icon
                          name={this.renderIcon(i)}
                          onClick={() => this.toggleIndex(i)}
                        />
                      ) : null;
                    return (
                      <Table.Cell key={`${item.id}-${cell.sortId}-${i}`}>
                        {icon}
                        {cell.sortId && cell.func && item[cell.sortId] !== null
                          ? cell.func(item[cell.sortId])
                          : null}
                        {cell.sortId && !cell.func && item[cell.sortId] !== null
                          ? item[cell.sortId]
                          : null}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
                {this.props.rowChildren && this.state.activeIndex === i
                  ? item.children.map((child, j) => (
                      <Table.Row
                        key={`${child.id}-${j}`}
                        className="sortable-table__child-row"
                      >
                        <Table.Cell
                          colSpan={headerCells.length}
                          onClick={() => this.props.onChildRowClick(child)}
                        >
                          <p>{child.id}</p>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  : null}
              </React.Fragment>
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
      sort: PropTypes.bool,
      func: PropTypes.func,
    }),
  ),
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ),
  rowChildren: PropTypes.bool,
  onRowClick: PropTypes.func,
  onChildRowClick: PropTypes.func,
  searchable: PropTypes.bool,
  searchTitleField: PropTypes.string,
  handleResultSelect: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  searchData: PropTypes.array,
  activeIndex: PropTypes.number,
};

SortableTable.defaultProps = {
  headerCells: [],
  data: [],
  rowChildren: false,
  onRowClick: () => {},
  onChildRowClick: () => {},
  searchable: false,
  searchTitleField: null,
  handleResultSelect: () => {},
  searchPlaceholder: 'Search...',
  searchData: [],
  activeIndex: -1,
};

export default SortableTable;
