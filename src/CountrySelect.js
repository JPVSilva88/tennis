import React, { PureComponent } from 'react';
import Select from 'react-select';
import './less/index.css';

class CountrySelect extends PureComponent {
  render() {
    const {options, onSelected, disabled} = this.props
    return (
      <div className="country-input">
        <Select
            id="select"
            options={options}
            isDisabled={disabled}
            value={null}
            getOptionValue={(c) => c.code}
            getOptionLabel={(c) => c.name}
            styles={{
              control: (styles, state) => ({
                ...styles,
                border: 0,
                borderRadius: 0,
                minHeight: 0,
                backgroundColor: "#616170",
                opacity: state.isDisabled ? 0.5 : 1
              }),
              input: (styles) => ({
                ...styles,
                color: "white"
              }),
              placeholder: (styles) => ({
                ...styles,
                color: "white",
                fontSize: "11px",
                opacity: 0.5
              }),
              menu: (styles) => ({
                ...styles,
                margin: 0
              }),
              menuList: (styles) => ({
                ...styles,
                backgroundColor: "#616170",
                padding: 0
              }),
              dropdownIndicator: (styles) => ({
                ...styles,
                color: "hsl(0,0%,80%)",
                '&:hover': {
                  backgroundColor: "#515158",
                  color: "hsl(0,0%,80%)",
                  cursor: "pointer"
                }
              }),
              option: (styles, state) => ({
                ...styles,
                height: "36px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderBottom: "1px solid #2b2b35",
                backgroundColor: state.isFocused ? "#515158" : "#616170",
                cursor: "pointer",
                textAlign: "center",
                '&:hover': {
                  backgroundColor: "#515158"
                }
              })
            }}
            placeholder="Select or type..."
            onChange={(newValue) => onSelected(newValue.code)}
            searchable={true}
        />
      </div>
    );
  }
}

export default CountrySelect;
