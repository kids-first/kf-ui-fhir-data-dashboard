import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Search} from 'semantic-ui-react';

export class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: this.props.data,
      isLoading: false,
      value: '',
    };
  }

  handleResultSelect = (e, {result}) => {
    this.setState(
      {
        value: result.title,
        results: [result],
      },
      () => this.props.handleResultSelect(this.state.results),
    );
  };

  handleSearchClear = () => {
    this.setState(
      {
        results: this.props.data,
        isLoading: false,
      },
      () => {
        this.props.handleResultSelect(this.state.results);
      },
    );
  };

  handleSearchChange = e => {
    this.setState({isLoading: true, value: e.target.value}, () => {
      if (this.state.value === '') {
        this.handleSearchClear();
      }

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i');
      const isMatch = result => re.test(result.title);

      this.setState({
        isLoading: false,
        results: _.filter(this.props.data, isMatch),
      });
    });
  };

  render() {
    const {isLoading, value, results} = this.state;

    return (
      <div>
        <Search
          placeholder={'Search for a resource'}
          loading={isLoading}
          onResultSelect={this.handleResultSelect}
          onSearchChange={_.debounce(this.handleSearchChange, 500, {
            leading: true,
          })}
          results={results}
          value={value}
          data={this.props.data}
        />
      </div>
    );
  }
}

SearchBar.propTypes = {
  data: PropTypes.array,
  handleResultSelect: PropTypes.func,
};

SearchBar.defaultProps = {
  data: [],
  handleResultSelect: () => {},
};

export default SearchBar;
