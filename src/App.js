import React, { Component } from 'react';
import './less/index.css';

import atp from './atp.csv';
import wta from './wta.csv';
import data from './data.json';
import test from './test.json';
import Papa from 'papaparse';
import Filter from "./Filter";
import rounds from "./rounds.json"
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

const ALL_TOURNAMENTS = ["Australian Open", "Roland Garros", "Wimbledon", "US Open"]

class App extends Component {
  constructor(props) {
    super(props)

    const allCountries = []
    Object.keys(data).forEach((tour) => {
      Object.keys(data[tour]).forEach((tournament) => {
        Object.keys(data[tour][tournament]).forEach((year) => {
          Object.keys(data[tour][tournament][year]).forEach((round) => {
            data[tour][tournament][year][round].forEach((country) => {
              const countryObj = allCountries.find((c) => c.code === country)
              if (!countryObj) {
                allCountries.push({
                  code: country,
                  name: i18nCountries.getName(country, "en") || i18nCountries.getName(i18nMapping[country], "en") || "",
                  count: 1
                })
              } else {
                countryObj.count++
              }
            })
          })
        })
      })
    })

    this.state = {
      tournament: "Wimbledon",
      countries: ["GBR"],
      round: "R16",
      tour: "ATP",
      allCountries: allCountries.sort((a,b) => a.name.localeCompare(b.name))
    }
  }

  componentWillMount() {
      //this.fetchCsv();
  }

  componentDidMount() {
    this.calculateChart()
  }

  calculateChart() {
    const {tournament, tour, countries, round} = this.state

    const chartData = []
    for(let i = 1968; i < 2020; i++) {
      chartData.push({year: i})
    }

    let max = 0

    if(!data[tour][tournament]) return

    Object.keys(data[tour][tournament]).forEach((year) => {
      if(!data[tour][tournament][year][round]) return
      const countryCount = this.countCountries(data[tour][tournament][year][round])
      countries.forEach((c) => {
        const val = countryCount[c] || 0
        max = Math.max(max, val)
        const country = i18nCountries.getName(c, "en") || i18nCountries.getName(i18nMapping[c], "en") || c
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

  // MIGHT NOT NEED
  getTournament(tournament) {
    switch(tournament) {
      case "Australian Championships":
        return "Australian Open"
      case "Australian Chps.":
          return "Australian Open"
      case "Us Open":
        return "US Open"
      case "French Open":
        return "Roland Garros"
      default:
        return tournament
    }
  }

  // MIGHT NOT NEED
  fetchCsv() {
    const allCountries = []
    
    return fetch(atp).then((response) => {
        let reader = response.body.getReader();
        let decoder = new TextDecoder('utf-8');

        let text = ""

        const func = (result) => {
          text += decoder.decode(result.value)
        }

        const keepGoing = (result) => {
          func(result)
          if(result.done) {
            Papa.parse(text, {
                complete: (res) => {
                  const newOrg = {}
                  const newData = res.data.filter((r) => {
                    return r[4] === "G"
                  }).map((r) => {
                    const year = parseInt(r[0].substr(0,4))
                    return {
                      year: r[0].substr(0,4),
                      tournament: this.getTournament(r[1]),
                      round: year === 1968 ? r[29] : r[25],
                      country: r[13],
                      country2: year === 1968 ? r[23] : r[21]
                    }
                  }).forEach((r) => {
                    if(!newOrg[r.tournament]) newOrg[r.tournament] = {}
                    if(!newOrg[r.tournament][r.year]) newOrg[r.tournament][r.year] = {}
                    if(!newOrg[r.tournament][r.year][r.round]) newOrg[r.tournament][r.year][r.round] = []

                    newOrg[r.tournament][r.year][r.round].push(r.country2)
                    newOrg[r.tournament][r.year][r.round].push(r.country)
                    const country = allCountries.find((c) => c.code === r.country)
                    if (!country) {
                      allCountries.push({
                        code: r.country,
                        name: i18nCountries.getName(r.country, "en"),
                        count: 1
                      })
                    } else {
                      country.count++
                    }
                    const country2 = allCountries.find((c) => c.code === r.country2)
                    if (!country2) {
                      allCountries.push({
                        code: r.country2,
                        name: i18nCountries.getName(r.country2, "en"),
                        count: 1
                      })
                    } else {
                      country2.count++
                    }

                    if(r.round === "F") {
                      newOrg[r.tournament][r.year].W = [r.country]
                    }
                  })
                  newOrg["Australian Open"][1979] = {}
                  newOrg["Australian Open"][1986] = {}
                  console.info(JSON.stringify(newOrg))
                  //console.info(newOrg)
                  this.setState({
                    data: newOrg,
                    allCountries
                  })
                  this.calculateChart(newOrg)
                }
            });
            return
          }

          return reader.read().then((val) => {keepGoing(val, this)})
        }

        return reader.read().then((result) => keepGoing(result));
    });
  }

  handleChange(key, value) {
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
            title="Tour"
            itemClass="tour"
            options={["WTA", "ATP"]}
            onSelected={(newValue) => this.handleChange("tour", newValue)}
            selectedValue={tour} />
          <Filter
            title="Tournament"
            itemClass="tournament"
            options={ALL_TOURNAMENTS}
            onSelected={(newValue) => this.handleChange("tournament", newValue)}
            selectedValue={tournament} />
          Countries
          <CountrySelect
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
            <div className="item empty">Add more countries</div>
            <div className="item empty">Add more countries</div>
            <div className="item empty">Add more countries</div>
            <div className="item empty">Add more countries</div>
            <div className="item empty">Add more countries</div>
          </div>
          <Filter
            title="Round"
            itemClass="round"
            options={rounds}
            onSelected={(newValue) => this.handleChange("round", newValue)}
            selectedValue={round} />
        </div>
        {this.state.chartData && 
          <Chart chartData={this.state.chartData} countries={countries} i18nMapping={i18nMapping} yTicks={yTicks} />}
      </div>
    );
  }
}

export default App;
