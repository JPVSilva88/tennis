import React, { Component } from 'react';
import ReactGA from 'react-ga';
import './less/index.css';

import data from './data.json';
import dataFull from './dataFull.json';
import test from './test.json';
import Filter from "./Filter";
import rounds from "./rounds.json"
import tours from "./tours.json"
import CountrySelect from "./CountrySelect";
import Chart from "./Chart";
import './flags.css';

var i18nCountries = require("i18n-iso-countries");
i18nCountries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const i18nMapping = {
  NED: "NLD",
  NGR: "NGA",
  LAT: "LVA",
  MON: "MCO",
  BAH: "BHS",
  URU: "URY",
  ZIM: "ZWE",
  DEN: "DNK",
  INA: "IDN",
  PUR: "PRI",
  SCG: "Serbia and Montenegro",
  MAD: "MDG",
  PAR: "PRY",
  CRO: "HRV",
  TPE: "TWN",
  YUG: "Yugoslavia",
  GRE: "GRC",
  BUL: "BGR",
  TCH: "Czechoslovakia",
  SUI: "CHE",
  SLO: "SVN",
  RSA: "ZAF",
  FRG: "West Germany",
  GER: "DEU",
  POR: "PRT",
  URS: "USSR",
  CHI: "CHL",
  CRC: "CRI",
  PHI: "PHL",
  ALG: "DZA",
  UNK: "",
  HAI: "HTI",
  BAR: "BRB",
  IRI: "IRN"
}

const countryNames = {
  RUS: "Russia"
}

const ALL_TOURNAMENTS = ["Australian Open", "Roland Garros", "Wimbledon", "US Open"]

class App extends Component {
  constructor(props) {
    super(props)

    const extra = {}
    const allCountries = []
    Object.keys(data).forEach((tour) => {
      extra[tour] = {}
      Object.keys(data[tour]).forEach((tournament) => {
        extra[tour][tournament] = {}
        Object.keys(data[tour][tournament]).forEach((year) => {
          extra[tour][tournament][year] = {}
          Object.keys(data[tour][tournament][year]).forEach((round) => {
            extra[tour][tournament][year][round] = {}
            data[tour][tournament][year][round].forEach((country) => {
              let c = extra[tour][tournament][year][round][country]
              if(c) {
                extra[tour][tournament][year][round][country]++
              } else {
                extra[tour][tournament][year][round][country] = 1
              }

              const countryObj = allCountries.find((c) => c.code === country)
              if (!countryObj) {
                const name = this.getCountryName(country)
                if(name) {
                  allCountries.push({
                    code: country,
                    name
                  })
                }
              }
            })
          })
        })
      })
    })

    Object.keys(test).forEach((tour) => {
      Object.keys(test[tour]).forEach((tournament) => {
        extra[tour][tournament][2019] = {}
          Object.keys(test[tour][tournament][2019]).forEach((round) => {
            extra[tour][tournament][2019][round] = test[tour][tournament][2019][round]
            Object.keys(test[tour][tournament][2019][round]).map((country) => {
              const countryObj = allCountries.find((c) => c.code === country)
              if (!countryObj) {
                const name = this.getCountryName(country)
                if(name) {
                  allCountries.push({
                    code: country,
                    name
                  })
                }
              }
            })
          })
      })
    })

    //console.info(JSON.stringify(extra))

    this.state = {
      tournament: "Wimbledon",
      countries: ["CHN", "RUS"],
      round: "R32",
      tour: "WTA",
      allCountries: allCountries.sort((a,b) => a.name.localeCompare(b.name))
    }
  }

  componentWillMount() {
    
  }

  componentDidMount() {
    this.calculateChart()
  }

  getCountryName(country) {
    return countryNames[country] || i18nCountries.getName(country, "en") || i18nCountries.getName(i18nMapping[country], "en")
  }

  calculateChart() {
    const {tournament, tour, countries, round} = this.state

    const chartData = []
    for(let i = 1968; i < 2020; i++) {
      chartData.push({year: i})
    }

    let max = 0

    if(!dataFull[tour][tournament]) return

    Object.keys(dataFull[tour][tournament]).forEach((year) => {
      if(!dataFull[tour][tournament][year][round]) return
      const countryCount = dataFull[tour][tournament][year][round]
      countries.forEach((c) => {
        const val = countryCount[c] || 0
        max = Math.max(max, val)
        const country = this.getCountryName(c)
        chartData[year - 1968][country] = val
      })
    })

    this.setState({
      chartData,
      yTicks: this.getTickValues(max)
    })
  }

  getTickValues(max) {
    if (max < 10) {
      return new Array(max < 5 ? 6 : max + 1).fill(undefined).map((v, i) => i)
    }

    if (max < 20) {
      return new Array(Math.ceil(max / 2) + 1).fill(undefined).map((v, i) => i * 2)
    }

    if (max < 50) {
      return new Array(Math.ceil(max / 5) + 1).fill(undefined).map((v, i) => i * 5)
    }

    return new Array(Math.ceil(max / 10) + 1).fill(undefined).map((v, i) => i * 10)
  }

  handleChange(key, value) {
    ReactGA.event({
      category: "filter",
      action: "changed",
      label: key
    })
    this.setState({
      [key]: value
    }, () => {
      this.calculateChart()
    })
  }

  toggleCountry(country) {
    const {countries} = this.state
    const i = countries.indexOf(country)

    if(i >= 0) {
      countries.splice(i,1)
    } else {
      countries.push(country)
    }

    this.setState({
      countries
    }, () => {
      this.calculateChart()
    })
  }

  countCountries(d) {
    const {countries} = this.state
    return d.reduce((acc, val) => {
      if(countries.length > 0 && !countries.includes(val)) return acc
      if(acc[val]) acc[val]++
      else acc[val] = 1

      return acc
    }, {})
  }

  render() {
    const {tournament, round, tour, allCountries, countries, yTicks} = this.state
    const selectedCountries = allCountries.filter((c) => countries.includes(c.code))
    const notSelectedCountries = allCountries.filter((c) => !countries.includes(c.code))
    return (
      <div className="App">
        <div className="filters">
          <Filter
            title="Pick a Tour"
            itemClass="tour"
            options={tours}
            onSelected={(newValue) => this.handleChange("tour", newValue)}
            selectedValue={tour} />
          <Filter
            title="Pick a Tournament"
            itemClass="tournament"
            options={ALL_TOURNAMENTS}
            onSelected={(newValue) => this.handleChange("tournament", newValue)}
            selectedValue={tournament} />
          Choose the Countries
          <CountrySelect
            disabled={countries.length >= 5}
            options={notSelectedCountries}
            onSelected={this.toggleCountry.bind(this)} />
          <div className="menu countries">
            {selectedCountries.map((c) => {
              let className = "item country"
              if(countries.includes(c.code)) {
                className += " selected"
              }
              return <div className={className}>
                  <div className="countryName">{c.name || c.code}</div>
                  <div className="remove" onClick={() => this.toggleCountry(c.code)}>
                    <div>x</div>
                  </div>
                </div>
            })}
            <div className="item empty">Add up to 5 countries</div>
            <div className="item empty">Add up to 5 countries</div>
            <div className="item empty">Add up to 5 countries</div>
            <div className="item empty">Add up to 5 countries</div>
            <div className="item empty">Add up to 5 countries</div>
          </div>
          <Filter
            title="Pick a Round"
            itemClass="round"
            options={rounds}
            onSelected={(newValue) => this.handleChange("round", newValue)}
            selectedValue={round} />
        </div>
        <div className="main">
          <div className="title">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <span>Grand Slam Stats</span>
            </div>
          {this.state.chartData && 
            <Chart chartData={this.state.chartData} countries={countries} getCountryName={this.getCountryName} yTicks={yTicks} />}
        </div>
      </div>
    );
  }
}

export default App;
