import React from 'react';
import PropTypes from 'prop-types';
import {getReferencedBy} from '../../utils/api';
import SortableTable from './SortableTable';
import './ReferenceTable.css';

class ReferenceTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingReferences: false,
      referenceData: [],
    };
  }

  componentDidMount() {
    this.fetchReferences();
  }

  componentDidUpdate(prevProps) {
    if (this.props.resourceId !== prevProps.resourceId) {
      this.fetchReferences();
    }
  }

  fetchReferences = async () => {
    this.setState({loadingReferences: true}, async () => {
      const references = await getReferencedBy(
        this.props.baseUrl,
        this.props.resourceType,
        this.props.resourceId,
      );
      let uniqueReferences = {};
      references.forEach(reference => {
        const mapValue = uniqueReferences[reference.profile];
        if (!!mapValue) {
          uniqueReferences[reference.profile] = {
            ...mapValue,
            total: mapValue.total + 1,
            children: mapValue.children.concat(reference),
          };
        } else {
          uniqueReferences[reference.profile] = {
            id: `${reference.resourceType}-${reference.name}`,
            resourceType: reference.resourceType,
            name: reference.name,
            profile: reference.profile,
            total: 1,
            children: [reference],
          };
        }
      });
      const referenceData = Object.values(uniqueReferences);
      this.setState({
        referenceData,
        loadingReferences: false,
      });
    });
  };

  render() {
    return (
      <div className="reference-table">
        <div
          className={`ui ${
            this.state.loadingReferences ? 'active' : 'disabled'
          } loader`}
        />
        {this.state.referenceData ? (
          <div>
            <h3>Resources that reference {this.props.resourceId}:</h3>
            <SortableTable
              headerCells={this.props.tableHeaders}
              data={this.state.referenceData}
              rowChildren={true}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

ReferenceTable.propTypes = {
  resourceId: PropTypes.string.isRequired,
  resourceType: PropTypes.string.isRequired,
  tableHeaders: PropTypes.arrayOf(
    PropTypes.shape({
      display: PropTypes.string.isRequired,
      sortId: PropTypes.string.isRequired,
      func: PropTypes.func,
    }),
  ),
  onClick: PropTypes.func,
  baseUrl: PropTypes.string.isRequired,
};

ReferenceTable.defaultProps = {
  onClick: () => {},
};

export default ReferenceTable;
