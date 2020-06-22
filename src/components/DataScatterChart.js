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
} from 'recharts';
import {Modal} from 'semantic-ui-react';
import './DataScatterChart.css';

let data = [
  {
    category: 1,
    id: '123',
    date: 3291,
    name: 'PhenotypicFeature',
    profile: [
      'http://ga4gh.org/fhir/phenopackets/StructureDefinition/PhenotypicFeature',
    ],
    resourceType: 'Observation',
    status: 'registered',
  },
  {
    category: 1,
    id: '456',
    date: 3294,
    name: 'PhenotypicFeature',
    profile: [
      'http://ga4gh.org/fhir/phenopackets/StructureDefinition/PhenotypicFeature',
    ],
    resourceType: 'Observation',
    status: 'registered',
  },
  {
    category: 1,
    id: '789',
    date: 3300,
    name: 'PhenotypicFeature',
    profile: [
      'http://ga4gh.org/fhir/phenopackets/StructureDefinition/PhenotypicFeature',
    ],
    resourceType: 'Observation',
    status: 'registered',
  },
  {
    category: 1,
    id: '1011',
    date: 3299,
    name: 'PhenotypicFeature',
    profile: [
      'http://ga4gh.org/fhir/phenopackets/StructureDefinition/PhenotypicFeature',
    ],
    resourceType: 'Observation',
    status: 'registered',
  },
  {
    category: 1,
    id: '1213',
    date: 3300,
    name: 'PhenotypicFeature',
    profile: [
      'http://ga4gh.org/fhir/phenopackets/StructureDefinition/PhenotypicFeature',
    ],
    resourceType: 'Observation',
    status: 'registered',
  },
  {
    category: 3,
    id: '1314',
    date: 3289,
    name: 'PhenotypicFeature',
    profile: [
      'http://ga4gh.org/fhir/phenopackets/StructureDefinition/PhenotypicFeature',
    ],
    resourceType: 'Observation',
    status: 'registered',
  },
  {
    category: 2,
    id: '1415',
    date: 3302,
    name: 'PhenotypicFeature',
    profile: [
      'http://ga4gh.org/fhir/phenopackets/StructureDefinition/PhenotypicFeature',
    ],
    resourceType: 'Observation',
    status: 'registered',
  },
  {
    category: 3,
    id: '1516',
    date: 3302,
    name: 'PhenotypicFeature',
    profile: [
      'http://ga4gh.org/fhir/phenopackets/StructureDefinition/PhenotypicFeature',
    ],
    resourceType: 'Observation',
    status: 'registered',
  },
  {
    category: 2,
    id: '1617',
    date: 3301,
    name: 'PhenotypicFeature',
    profile: [
      'http://ga4gh.org/fhir/phenopackets/StructureDefinition/PhenotypicFeature',
    ],
    resourceType: 'Observation',
    status: 'registered',
  },
];

let dates = [3291, 3294, 3299, 3300, 3289, 3302, 3301];
let categories = ['', 'Condition', 'Observation', 'Specimen'];

const CustomizedDot = props => {
  const colors = ['#90278e', '#009cb8', '#e83a9c', '#2b388f', '#01aeed'];
  const scaleFactor = 1.5;
  const {date, category, data, cx, cy} = props;
  const totalIds = data.filter(x => x.category === category && x.date === date)
    .length;
  const radius = 10 + totalIds * scaleFactor;
  const diameter = 2 * radius;
  return (
    <svg width={diameter} height={diameter} style={{overflow: 'visible'}}>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        strokeWidth="0"
        fill={colors[category]}
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
    };
  }

  getDomain = dates => {
    const min = Math.min(...dates);
    const max = Math.max(...dates);
    const domain = [Math.floor(min / 5) * 5, Math.ceil(max / 5) * 5];
    return domain;
  };

  formatYAxis = number => categories[number];

  renderTooltip = props => {
    const {payload} = props;
    if (payload && payload.length > 0) {
      const date = payload[0].payload.date;
      const category = payload[0].payload.category;
      const ids = data
        .filter(x => x.category === category && x.date === date)
        .map(x => x.id);
      return (
        <div className="scatter-chart__tooltip">
          <p>Category: {categories[category]}</p>
          <p>Date: {date}</p>
          <p>Total events: {ids.length}</p>
        </div>
      );
    }
    return null;
  };

  onDotClick = props => {
    const {category, date} = props;
    const ids = data.filter(x => x.category === category && x.date === date);
    this.showModal(ids, category, date);
  };

  showModal = (ids, category, date) => {
    console.log('ids', ids);
    this.setState({
      showModal: true,
      modalContent: {
        ids,
        date,
        category,
      },
    });
  };

  closeModal = () => {
    this.setState({showModal: false, modalContent: null});
  };

  render() {
    // data = this.props.data;
    // categories = this.props.categories;
    // dates = this.props.dates;
    const referenceLine = this.props.referenceLine;
    const domain = this.getDomain(dates);
    const {showModal, modalContent} = this.state;
    return (
      <div>
        <ScatterChart
          width={1000}
          height={categories.length * 100}
          margin={{top: 20, right: 80, bottom: 10, left: 80}}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="date" domain={domain} name="days" />
          <YAxis
            domain={[0, categories.length - 1]}
            allowDecimals={false}
            interval={0}
            type="number"
            dataKey="category"
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
              label={{
                position: 'top',
                value: `${referenceLine.label}`,
                fill: 'red',
                fontSize: 14,
              }}
            />
          ) : null}
          <Scatter
            data={data}
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
              {categories[modalContent.category]} at {modalContent.date}
            </Modal.Header>
            <Modal.Content>
              <ul>
                {modalContent.ids.map(x => (
                  <li key={x.id}>{x.id}</li>
                ))}
              </ul>
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
      category: PropTypes.number.isRequired,
      date: PropTypes.number.isRequired,
      id: PropTypes.string.isRequired,
    }),
  ),
  categories: PropTypes.array,
  dates: PropTypes.array,
  referenceLine: PropTypes.shape({
    x: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
  }),
};

DataScatterChart.defaultProps = {
  data: [],
  categories: [],
  dates: [],
  referenceLine: {},
};

export default DataScatterChart;
