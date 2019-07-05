import React, { Component } from 'react';
import {ResponsiveContainer, LineChart, XAxis, YAxis, Line, Legend, Tooltip, CartesianGrid} from "recharts"
import './less/index.css';

var i18nCountries = require("i18n-iso-countries");
i18nCountries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const COLORS = ["#3dadb2", "#F3832E", "#C32E9A", "#289428", "#EEDE51"]

class CountrySelect extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hover: null
    }
  }
  handleMouseEnter = (o) => {
    const { dataKey } = o

    this.setState({
      hover: dataKey
    })
  }

  handleMouseLeave = () => {
    this.setState({
      hover: null,
    })
  }

  formatLegend = (value, entry) => {
    const {color} = entry
    return <span style={{color}}>{value}</span>
  }

  render() {
    const {chartData, countries, getCountryName, yTicks} = this.props
    return (
      <div className="chart">
        <ResponsiveContainer width="95%" height={400}>
          <LineChart
            data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="year"
              padding={{ left: 10 }}
              ticks={[1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015]}/>
            <YAxis
              ticks={yTicks}
              domain={[0, dataMax => Math.max(dataMax, 5)]} />
            <Tooltip animationDuration={500} />
            <Legend 
              formatter={this.formatLegend}
              onMouseEnter={this.handleMouseEnter}
              onMouseLeave={this.handleMouseLeave} />
            {countries.map((l, i) => {
              const key = getCountryName(l)
              const {hover} = this.state
                return <Line
                  type="monotone"
                  dot={{ fill: "#2b2b35", strokeWidth: 1, r: hover === key ? 4 : 3}}
                  strokeOpacity={!hover || hover === key ? 1 : 0.5}
                  strokeWidth={hover === key ? 3 : 2}
                  stroke={COLORS[i]}
                  dataKey={key}
                  activeDot={{ strokeWidth: 1, r: 5 }} />
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default CountrySelect;
