import React from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

class DataBarChart extends React.Component {
  render() {
    const data = this.props.data.filter(x => x.value > 0);
    const barSize = 10;
    return (
      <ResponsiveContainer height={barSize * data.length + 4}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 5,
          }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" orientation="top" />
          <YAxis width={250} type="category" dataKey="name" />
          <Tooltip />
          <Bar dataKey="value" fill="#41b6e6" barSize={barSize} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}

DataBarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
  ),
};

DataBarChart.defaultProps = {
  data: [],
};

export default DataBarChart;
