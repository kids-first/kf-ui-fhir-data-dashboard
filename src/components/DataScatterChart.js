import React from 'react';
import {ScatterChart, Scatter, XAxis, YAxis, Tooltip} from 'recharts';

const SmallDot = props => {
  const radius = 10;
  const diameter = radius * 2;
  return (
    <svg width={diameter} height={diameter} style={{overflow: 'visible'}}>
      <circle
        cx={props.cx}
        cy={props.cy}
        r={3}
        stroke="green"
        strokeWidth="0"
        fill={props.color}
      />
    </svg>
  );
};

class CustomizedLabel extends React.Component {
  render() {
    const {x, y, stroke, value, id, data} = this.props;
    const date = data.filter(x => x.id === id).map(x => x.date);
    const total =
      date.length > 0 ? data.filter(x => x.date === date[0]).length : 0;
    return (
      <text x={x} y={y} dy={-4} fill={stroke} fontSize={10} textAnchor="middle">
        {total}
      </text>
    );
  }
}

class DataScatterChart extends React.Component {
  renderTooltip = props => {
    const {active, payload} = props;

    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const ids = this.props.data
        .filter(x => x.date === data.date)
        .map(x => x.id);
      return (
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #999',
            margin: 0,
            padding: 10,
          }}
        >
          <p>
            Events on {data.date} ({ids.length} total):
          </p>
          <ul>
            {ids.map(id => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </div>
      );
    }

    return null;
  };

  getDomain = dates => {
    const min = Math.round(Math.min(...dates) / 10) * 10;
    const max = Math.round(Math.max(...dates) / 10) * 10;
    return [min, max];
  };

  render() {
    const {label, dates} = this.props;
    let dateSet = {};
    dates.forEach(date => {
      dateSet[date] = 1;
    });
    const data = this.props.data.map(x => {
      const index = dateSet[x.date];
      dateSet[x.date] = index + 1;
      return {...x, index};
    });
    const domain = this.getDomain(dates);
    return (
      <div>
        <ScatterChart
          width={1000}
          height={200}
          margin={{top: 15, right: 50, bottom: 0, left: 50}}
        >
          <XAxis
            type="number"
            dataKey="date"
            name="hour"
            domain={domain}
            tickLine={{transform: 'translate(0, -6)'}}
          />
          <YAxis
            type="number"
            dataKey="index"
            height={10}
            width={80}
            tick={false}
            tickLine={false}
            axisLine={false}
            label={{value: `${label}`, position: 'insideRight'}}
          />
          <Tooltip
            cursor={{strokeDasharray: '3 3'}}
            wrapperStyle={{zIndex: 100}}
            content={this.renderTooltip}
          />
          <Scatter
            data={data}
            fill="#8884d8"
            shape={<SmallDot color="#8884d8" />}
          />
        </ScatterChart>
      </div>
    );
  }
}

export default DataScatterChart;
