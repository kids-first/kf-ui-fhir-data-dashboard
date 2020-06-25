import React from 'react';
import PropTypes from 'prop-types';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Label,
} from 'recharts';
import {Modal} from 'semantic-ui-react';
import SortableTable from './tables/SortableTable';
import './DataScatterChart.css';

const resourceMapping = {
  Observation: [
    x => {
      if (x.component) {
        if (x.component.length > 1) {
          return 'Multiple';
        } else {
          x = x.component[0];
        }
      } else return x.code && x.code.text ? x.code.text : null;
    },
    x => {
      if (x.component) {
        if (x.component.length > 1) {
          return 'Multiple';
        } else {
          x = x.component[0];
        }
      }
      if (x.interpretation) {
        return x.interpretation
          .map(elt => elt.text)
          .filter(x => x)
          .join(', ');
      } else if (x.valueQuantity) {
        return x.valueQuantity.value;
      } else if (x.valueBoolean) {
        return x.valueBoolean.toString();
      } else if (x.valueCodeableConcept) {
        return x.valueCodeableConcept.text;
      } else {
        return null;
      }
    },
  ],
  Condition: [
    x => {
      if (x.extension) {
        return x.extension
          .map(ext =>
            ext.valueCodeableConcept && ext.valueCodeableConcept.text
              ? ext.valueCodeableConcept.text
              : null,
          )
          .filter(x => x)
          .join(', ');
      } else if (x.code && x.code.text) {
        return x.code.text;
      }
    },
    x => {
      if (x.verificationStatus) {
        return x.verificationStatus.coding.map(codes => codes.code).join(', ');
      } else {
        return null;
      }
    },
  ],
  Specimen: [
    x => (x.type && x.type.text ? x.type.text : null),
    x =>
      x.collection && x.collection.quantity
        ? x.collection.quantity.value
        : null,
  ],
  DiagnosticReport: [
    x => {
      if (x.category) {
        return x.category
          .map(cat =>
            cat.coding ? cat.coding.map(code => code.display).join(', ') : '',
          )
          .join(', ');
      }
    },
    x => (x.code ? x.code.text : null),
  ],
  Encounter: [
    x => {
      if (x.type) {
        return x.type.map(type => type.text).join(', ');
      } else {
        return null;
      }
    },
    x => (x.period ? `Start: ${x.period.start}; End: ${x.period.end}` : null),
  ],
};

const resourceTableHeaders = {
  Observation: [
    {
      display: 'Code',
      sortId: 'Code',
      sort: true,
    },
    {display: 'Value', sortId: 'Value', sort: true},
  ],
  Condition: [
    {display: 'Code', sortId: 'Code', sort: true},
    {display: 'Status', sortId: 'Status', sort: true},
  ],
  Specimen: [
    {display: 'Type', sortId: 'Type', sort: true},
    {display: 'Quantity', sortId: 'Quantity', sort: true},
  ],
  DiagnosticReport: [
    {display: 'Category', sortId: 'Category', sort: true},
    {display: 'Type', sortId: 'Type', sort: true},
  ],
  Encounter: [
    {display: 'Type', sortId: 'Type', sort: true},
    {display: 'Period', sortId: 'Period', sort: true},
  ],
};

const CustomizedReferenceLabel = props => {
  const {fill, value, textAnchor, fontSize, viewBox, dy, dx} = props;
  const x = viewBox.width + viewBox.x + 20;
  const y = viewBox.y - 6;
  console.log('this.props', props);
  return (
    <text
      x={x - 15}
      y={y - 20}
      dy={dy}
      dx={dx}
      fill="red"
      fontSize={14}
      textAnchor="middle"
    >
      {value}
    </text>
  );
};

const CustomizedDot = props => {
  const colors = ['#90278e', '#009cb8', '#e83a9c', '#2b388f', '#01aeed'];
  const scaleFactor = 1.5;
  const {xDate, yCategoryIndex, data, cx, cy} = props;
  const totalIds = data.filter(
    x => x.yCategoryIndex === yCategoryIndex && x.xDate === xDate,
  ).length;
  const radius = Math.min(8 + totalIds * scaleFactor, 20);
  const diameter = 2 * radius;

  return (
    <svg width={diameter} height={diameter} style={{overflow: 'visible'}}>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        strokeWidth="0"
        fill={colors[yCategoryIndex]}
        shapeRendering="geometricPrecision"
      />
    </svg>
  );
};

class DataScatterChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalContent: null,
      uniqueDataPoints: this.getUniqueDataPoints(props.data),
    };
  }

  formatYAxis = number =>
    number === this.props.categories.length
      ? ''
      : this.props.categories[number];

  renderTooltip = props => {
    const {payload} = props;
    if (payload && payload.length > 0) {
      const xDate = payload[0].payload.xDate;
      const yCategoryIndex = payload[0].payload.yCategoryIndex;
      const ids = this.props.data
        .filter(x => x.yCategoryIndex === yCategoryIndex && x.xDate === xDate)
        .map(x => x.id);
      return (
        <div className="scatter-chart__tooltip">
          <p>Category: {this.props.categories[yCategoryIndex]}</p>
          <p>Date: {xDate}</p>
          <p>Total events: {ids.length}</p>
        </div>
      );
    }
    return null;
  };

  onDotClick = props => {
    const {yCategoryIndex, xDate} = props;
    const ids = this.props.data.filter(
      x => x.yCategoryIndex === yCategoryIndex && x.xDate === xDate,
    );
    this.showModal(ids, yCategoryIndex, xDate);
  };

  showModal = (ids, yCategoryIndex, xDate) => {
    this.setState({
      showModal: true,
      modalContent: {
        ids: ids.map(id => {
          let newId = {};
          const funcs = resourceMapping[this.props.categories[yCategoryIndex]];
          const cols = funcs.map(func => func(id));
          resourceTableHeaders[this.props.categories[yCategoryIndex]].forEach(
            (header, i) => {
              newId[header.sortId] = cols[i];
            },
          );
          newId.id = id.id;
          return newId;
        }),
        xDate,
        yCategoryIndex,
      },
    });
  };

  closeModal = () => {
    this.setState({showModal: false, modalContent: null});
  };

  onRowClick = row => {
    this.props.history.push(
      `/resources/${
        this.props.categories[this.state.modalContent.yCategoryIndex]
      }/id=${row.id}`,
    );
  };

  getUniqueDataPoints = data => {
    let map = new Map();
    data.forEach(point => {
      if (!map.has(point.xDate)) {
        map.set(point.xDate, new Set());
      }
      map.set(point.xDate, map.get(point.xDate).add(point.yCategoryIndex));
    });
    let points = [];
    map.forEach((value, key) => {
      [...value].forEach(val => {
        points.push({xDate: key, yCategoryIndex: val});
      });
    });
    return points;
  };

  render() {
    const {data, categories, referenceLine} = this.props;
    const {uniqueDataPoints} = this.state;
    const {showModal, modalContent} = this.state;

    return (
      <div>
        <ScatterChart
          width={1000}
          height={categories.length * 100}
          margin={{top: 50, right: 80, bottom: 50, left: 80}}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="category"
            dataKey="xDate"
            allowDuplicatedCategory={false}
          >
            <Label value="Date" offset={0} position="bottom" />
          </XAxis>
          <YAxis
            domain={[0, categories.length - 1]}
            allowDecimals={false}
            interval={0}
            type="number"
            dataKey="yCategoryIndex"
            tickFormatter={this.formatYAxis}
            width={100}
            tickMargin={20}
          />
          <ZAxis type="category" dataKey="id" name="ID" />
          <Tooltip
            cursor={{strokeDasharray: '3 3'}}
            content={this.renderTooltip}
          />
          {referenceLine ? (
            <ReferenceLine
              x={referenceLine.x}
              stroke="red"
              label={<CustomizedReferenceLabel value={referenceLine.label} />}
            />
          ) : null}
          <Scatter
            data={uniqueDataPoints}
            fill="#8884d8"
            shape={<CustomizedDot data={data} />}
            onClick={this.onDotClick}
          />
        </ScatterChart>
        {showModal ? (
          <Modal
            open={showModal}
            onClose={() => this.closeModal()}
            dimmer="inverted"
          >
            <Modal.Header>
              {categories[modalContent.yCategoryIndex]} at {modalContent.xDate}
            </Modal.Header>
            <Modal.Content>
              <SortableTable
                headerCells={[
                  {
                    display: 'ID',
                    sortId: 'id',
                    sort: true,
                  },
                  ...resourceTableHeaders[
                    categories[modalContent.yCategoryIndex]
                  ],
                ]}
                data={modalContent.ids}
                onRowClick={this.onRowClick}
              />
            </Modal.Content>
          </Modal>
        ) : null}
      </div>
    );
  }
}

DataScatterChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      yCategoryIndex: PropTypes.number.isRequired,
      xDate: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
    }),
  ),
  categories: PropTypes.array,
  dates: PropTypes.array,
  referenceLine: PropTypes.shape({
    x: PropTypes.string.isRequired,
    label: PropTypes.string,
  }),
  history: PropTypes.object.isRequired,
};

DataScatterChart.defaultProps = {
  data: [],
  categories: [],
  dates: [],
  referenceLine: {},
};

export default DataScatterChart;
