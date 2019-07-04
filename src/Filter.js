import React, { PureComponent } from 'react';
import './less/index.css';

class Filter extends PureComponent {
  render() {
    const {title, options, itemClass, onSelected, selectedValue} = this.props
    return (
      <>
        {title}
        <div className="menu">
          {options.map((item) => {
            const key = item.key || item
            const text = item.name || item
            let className = "item "
            className += itemClass
            if(key === selectedValue) {
              className += " selected"
            }
            return <div className={className} onClick={() => onSelected(key)}>
                {text}
              </div>
          })}
        </div>
      </>
    );
  }
}

export default Filter;
