import React from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

class DataBarChart extends React.Component {
  handleClick = e => {
    const payload =
      e && e.activePayload && e.activePayload[0] && e.activePayload[0].payload;
    this.props.handleClick(payload);
  };

  render() {
    const data = this.props.data.filter(x => x.value > 0);
    const barSize = 10;
    let height = Math.max(barSize * data.length + 4, 120);
    if (data.length > 0) {
      return (
        <ResponsiveContainer height={height}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 0,
              bottom: 5,
            }}
            layout="vertical"
            onClick={this.handleClick}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" orientation="top" />
            <YAxis width={250} type="category" dataKey="name" />
            <Tooltip />
            <Bar dataKey="value" fill="#41b6e6" barSize={barSize} />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return <p>No Data</p>;
    }
  }
}

DataBarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
  ),
  handleClick: PropTypes.func,
};

DataBarChart.defaultProps = {
  data: [],
  handleClick: () => {},
};

export default DataBarChart;
